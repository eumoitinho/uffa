import React from 'react';
import { useForm } from '@mantine/form'; // Importação do hook useForm do pacote @mantine/form
import { Link, useNavigate } from 'react-router-dom';
import { Card, Stack, TextInput, Divider, Button, Anchor, Image } from '@mantine/core'; // Importação de componentes do pacote @mantine/core
import { collection, getDocs, where, query } from 'firebase/firestore'; // Importação de funções relacionadas ao Firestore do Firebase
import { fireDb } from '../firebaseConfig'; // Importação da configuração do Firebase
import cryptojs from 'crypto-js'; // Importação da biblioteca crypto-js para criptografia/descriptografia
import { notifications } from '@mantine/notifications'; // Importação do módulo de notificações do pacote @mantine/notifications
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';
import { Center } from '@mantine/core';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loginform = useForm({ // Inicialização do hook useForm para criar um formulário controlado
    initialValues: {
      email: "",
      password: "",
    },
  });


  const onSubmit = async (event) => { // Definição da função de submissão do formulário (assíncrona)
    event.preventDefault(); // Impedir o comportamento padrão de envio do formulário

    try {
      dispatch(ShowLoading());
      const qry = query( // Criação de uma consulta ao Firestore para encontrar usuários com base no email fornecido
        collection(fireDb, "users"), // Coleção "users" no Firestore
        where("email", "==", loginform.values.email), // Filtro para encontrar usuários com o email fornecido no formulário
      );
      const existingusers = await getDocs(qry); // Execução da consulta e aguarda a resposta

      if (existingusers.size > 0) { // Verifica se foram encontrados usuários com base no tamanho da resposta
        // Descriptografando a senha do usuário armazenada no Firestore
        const decryptedPassword = cryptojs.AES.decrypt(
          existingusers.docs[0].data().password, // Senha criptografada armazenada no Firestore
          "uffa" // Chave de descriptografia
        ).toString(cryptojs.enc.Utf8);

        if (decryptedPassword === loginform.values.password) { // Verifica se a senha descriptografada é igual à senha fornecida no formulário
          notifications.show({ // Exibe uma notificação de sucesso
            id: 'Usuário logado',
            message: 'Você realizou login!',
            color: 'teal',
          });

          const dataToPutInLocalStorage = { // Cria um objeto com informações do usuário para armazenar no localStorage
            name: existingusers.docs[0].data().name,
            email: existingusers.docs[0].data().email,
            id: existingusers.docs[0].id,
          };
          localStorage.setItem("user", JSON.stringify(dataToPutInLocalStorage)); // Armazena os dados do usuário no localStorage
          navigate("/");
        } else { // Senha inválida
          notifications.show({ // Exibe uma notificação de erro
            id: 'Credenciais invalidas',
            message: 'Credenciais inválidas!',
            color: 'red',
            loading: +true, // Define o estado de carregamento para verdadeiro (conversão de booleano para número)
          });
        }
      } else { // Usuário não encontrado
        notifications.show({ // Exibe uma notificação informando que o usuário não foi encontrado
          id: 'Usuário não encontrado',
          message: 'Usuário não encontrado!',
          color: "red",
        });
      }
      dispatch(HideLoading());
    } catch (error) { // Tratamento de erro genérico
      dispatch(HideLoading());
      notifications.show({ // Exibe uma notificação de erro genérico
        id: 'Erro',
        message: 'Oops! Algo deu errado...',
        color: 'red',
      });
    }
  };

  return (
    <div className="flex h-screen justify-center items-center">
      <Card xs={{ // Estilos personalizados para o componente Card
        width: 400,
        padding: "sm",
      }} shadow="lg">
          <Center>
          <Image
          src={require("file:///D:/TCC/logo-png.png")}
          height={45}
          width={100}
            />
          </Center>
        <Center>
        <h1>Bem-vindo!</h1>
        </Center>
        <form action="" onSubmit={onSubmit}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="Digite seu email"
              name="email"
              {...loginform.getInputProps("email")}
            />
            <TextInput
              label="Senha"
              placeholder="Digite sua senha"
              type="password"
              name="password"
              {...loginform.getInputProps("password")}
            />
            <Button type='submit' variant='outline' color='teal'>Entrar</Button>
            <Button component={Link} to="/register" color= 'teal'>Não possui uma conta? Registre-se aqui!</Button>
          </Stack>
        </form>
      </Card>
    </div>
  );
}

export default Login;
