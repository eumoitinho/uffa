import React from 'react';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Stack, TextInput, Button } from '@mantine/core';
import { loginUser } from '../services/apiService';
import { notifications } from '@mantine/notifications';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';
import { Center, Image } from '@mantine/core';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loginform = useForm({
    initialValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      dispatch(ShowLoading());

      const response = await loginUser(loginform.values.email, loginform.values.password);

      if (response && response.user) {
        notifications.show({
          id: 'Usuário logado',
          message: 'Você realizou login!',
          color: 'teal',
        });

        const dataToPutInLocalStorage = {
          name: response.user.name,
          email: response.user.email,
          id: response.user.id,
        };
        localStorage.setItem("user", JSON.stringify(dataToPutInLocalStorage));
        navigate("/");
      } else {
        notifications.show({
          id: 'Credenciais invalidas',
          message: 'Credenciais inválidas!',
          color: 'red',
        });
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      if (error.response?.status === 401) {
        notifications.show({
          id: 'Credenciais invalidas',
          message: 'Credenciais inválidas!',
          color: 'red',
        });
      } else if (error.response?.status === 404) {
        notifications.show({
          id: 'Usuário não encontrado',
          message: 'Usuário não encontrado!',
          color: "red",
        });
      } else {
        notifications.show({
          id: 'Erro',
          message: 'Oops! Algo deu errado...',
          color: 'red',
        });
      }
    }
  };

  return (
    <div className="flex h-screen justify-center items-center">
      <Card xs={{
        width: 400,
        padding: "sm",
      }} shadow="lg">
          <Center>
          <Image
          src={process.env.PUBLIC_URL + '/logo-png.png'} alt="Logo"
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
