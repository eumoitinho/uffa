import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Stack, Button, Center, Text, Image, Anchor } from '@mantine/core';
import { loginWithGoogle } from '../services/apiService';
import { notifications } from '@mantine/notifications';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';
import { GoogleLogin } from '@react-oauth/google';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      dispatch(ShowLoading());

      if (!credentialResponse?.credential) {
        notifications.show({
          id: 'google-credencial',
          message: 'Não foi possível obter a credencial do Google.',
          color: 'red',
        });
        dispatch(HideLoading());
        return;
      }

      const response = await loginWithGoogle(credentialResponse.credential);

      if (response && response.user) {
        notifications.show({
          id: 'Usuário logado',
          message: 'Login com Google realizado com sucesso!',
          color: 'teal',
        });

        const dataToPutInLocalStorage = {
          name: response.user.name,
          email: response.user.email,
          id: response.user.id,
          photo: response.user.photo,
        };
        localStorage.setItem("user", JSON.stringify(dataToPutInLocalStorage));
        localStorage.setItem("token", response.token);

        if (response.needsOnboarding) {
          localStorage.setItem("needsOnboarding", "true");
          navigate("/onboarding");
        } else {
          localStorage.removeItem("needsOnboarding");
          navigate("/");
        }
      } else {
        notifications.show({
          id: 'Login inválido',
          message: 'Não foi possível autenticar com o Google.',
          color: 'red',
        });
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      notifications.show({
        id: 'Erro',
        message: 'Oops! Algo deu errado...',
        color: 'red',
      });
    }
  };

  return (
    <div className="flex h-screen justify-center items-center">
      <Card sx={{
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
        <Stack align="center" spacing="md" mt="md">
          <Text size="sm" color="dimmed">
            Entre com sua conta Google para continuar.
          </Text>
          {googleClientId ? (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                notifications.show({
                  id: 'google-erro',
                  message: 'Falha ao autenticar com o Google.',
                  color: 'red',
                });
              }}
              theme="outline"
              size="large"
              shape="pill"
            />
          ) : (
            <Button variant="outline" color="teal" disabled>
              Configure REACT_APP_GOOGLE_CLIENT_ID
            </Button>
          )}
        </Stack>
        <Center mt="lg">
          <Text size="xs" color="dimmed">
            <Anchor component={Link} to="/privacy" color="dimmed">Política de Privacidade</Anchor>
            {' | '}
            <Anchor component={Link} to="/terms" color="dimmed">Termos de Uso</Anchor>
          </Text>
        </Center>
      </Card>
    </div>
  );
}

export default Login;
