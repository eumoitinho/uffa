import React, { useState } from 'react';
import { isEmail, useForm } from '@mantine/form'; // Importação do hook useForm do pacote @mantine/form
import { Link, useNavigate } from 'react-router-dom';
import { Card, Stack, TextInput, Divider, Button, Anchor } from '@mantine/core'; // Importação de componentes do pacote @mantine/core
import { addDoc, collection, getDocs, where, query } from 'firebase/firestore'; // Importação de funções relacionadas ao Firestore do Firebase
import { fireDb } from '../firebaseConfig'; // Importação da configuração do Firebase
import cryptojs from "crypto-js"; // Importação da biblioteca crypto-js para criptografia/descriptografia
import { notifications } from '@mantine/notifications'; // Importação do módulo de notificações do pacote @mantine/notifications
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';
import { Center, Image } from '@mantine/core';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function Register() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const registerform = useForm({ // Inicialização do hook useForm para criar um formulário controlado
        initialValues: {
            name: "",
            email: "",
            password: "",
        },
        validate: {
            name: (value) => (value.length < 2 ? 'Seu nome precisa ter mais de duas letras' : null),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'),
        },
    });

    const [selectedPhotoFile, setSelectedPhotoFile] = useState(null); // Estado para armazenar a foto selecionada pelo usuário


  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhotoFile(file); // Armazena o arquivo da foto selecionada no estado selectedPhotoFile
    }
  };

 const onSubmit = async (event) => {
  event.preventDefault();

  try {
    // Verificar se o usuário já existe no Firestore
    dispatch(ShowLoading());
    const qry = query(
      collection(fireDb, "users"), // Coleção "users" no Firestore
      where("email", "==", registerform.values.email) // Filtro para encontrar usuários com o email fornecido no formulário
    );
    const existingusers = await getDocs(qry); // Execução da consulta e aguarda a resposta

    if (existingusers.size > 0) { // Verifica se já existe um usuário com o mesmo email
      notifications.show({ // Exibe uma notificação informando que o usuário já está cadastrado
        id: 'Usuário já cadastrado',
        message: 'Usuário já cadastrado',
        color: "red",
        loading: true,
      });
      dispatch(HideLoading());
      return; // Retorna para interromper o fluxo do código

    } else {
      // Criptografando a senha do usuário
      const encryptedPassword = cryptojs.AES.encrypt(
        registerform.values.password, // Senha fornecida no formulário
        "uffa" // Chave de criptografia
      ).toString();

      let photoUrl = ''; // Variável para armazenar a URL da foto (inicialmente vazia)

      // Enviar a foto para o Firebase Storage (caso uma foto tenha sido selecionada)
      if (selectedPhotoFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `user_photos/${registerform.values.email}`);
        await uploadBytes(storageRef, selectedPhotoFile);

        const photoUrl = await getDownloadURL(storageRef);

        // Adicionar os dados do usuário ao Firestore, incluindo a URL da foto
        const response = await addDoc(
          collection(fireDb, "users"),
          {
            ...registerform.values,
            password: encryptedPassword,
            photo: photoUrl,
          }
        );

        if (response.id) {
          notifications.show({
            id: 'Usuário cadastrado',
            message: 'Usuário cadastrado com sucesso!',
            color: "teal",
          });
          navigate("/login");
        } else {
          notifications.show({
            id: 'Falha no registro',
            message: 'Falha no registro do usuário!',
            color: "red",
            loading: true,
          });
        }
      }
    }
    dispatch(HideLoading());
  } catch (error) {
    dispatch(HideLoading());
    console.log(error);
    notifications.show({
      id: 'erro-oops',
      message: 'Oops! Algo deu errado :(',
      color: "red",
      loading: true,
    });
  }
};

    return (
        <div className="flex h-screen justify-center items-center">
            <Card sx={{ // Estilos personalizados para o componente Card
                width: 400,
                padding: "sm",
            }}
                shadow="lg"
                withborder
            >
                <Center>
                    <Image
                        src={require("file:///D:/TCC/logo-png.png")}
                        height={45}
                        width={100}
                    />
                </Center>
                <Center>
                    <h1>Registre-se</h1>
                </Center>
                <Divider variant='dotted' color='gray' /> {/* Linha separadora visual */}
                <form action="" onSubmit={onSubmit}>
                    <Stack>
                        <TextInput
                            label="Nome"
                            placeholder="Digite seu nome"
                            name="name"
                            {...registerform.getInputProps("name")} // Propriedades do hook useForm para o campo "name"
                        />
                        <TextInput
                            label="E-mail"
                            placeholder="Digite seu e-mail"
                            name="email"
                            {...registerform.getInputProps("email")} // Propriedades do hook useForm para o campo "email"
                        />
                        <TextInput
                            label="Senha"
                            placeholder="Digite sua senha"
                            name="password"
                            type="password"
                            {...registerform.getInputProps("password")} // Propriedades do hook useForm para o campo "password"
                        />
                        <label>
              Foto: 
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
            </label>
            {selectedPhotoFile && (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden' }}>
                <img src={URL.createObjectURL(selectedPhotoFile)} alt="Selected" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
                        <Button
                            type='submit'
                            variant='outline'
                            color='teal'
                        >
                            Enviar
                        </Button>
                        <Button component={Link} to="/login" color= 'teal'>Possui uma conta? Entre aqui!</Button>
                    </Stack>
                </form>
            </Card>
        </div>
    );
}

export default Register;
