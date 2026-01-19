import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Stack, Button, Center, Text, Image, Anchor, Box } from '@mantine/core';
import { loginWithGoogle } from '../services/apiService';
import { notifications } from '@mantine/notifications';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';
import { useGoogleLogin } from '@react-oauth/google';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      dispatch(ShowLoading());

      if (!tokenResponse?.access_token) {
        notifications.show({
          id: 'google-credencial',
          message: 'Não foi possível obter a credencial do Google.',
          color: 'red',
        });
        dispatch(HideLoading());
        return;
      }

      // Envia o access_token para o backend
      const response = await loginWithGoogle(tokenResponse.access_token, 'access_token');

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

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: (error) => {
      console.error('Google login error:', error);
      notifications.show({
        id: 'google-erro',
        message: 'Falha ao autenticar com o Google.',
        color: 'red',
      });
    },
    flow: 'implicit',
  });

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
      }}
    >
      <Card
        w={400}
        padding="xl"
        radius="xl"
        shadow="lg"
        style={{
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        <Center>
          <Image
            src={process.env.PUBLIC_URL + '/logo-png.png'}
            alt="Logo"
            h={50}
            w={110}
            fit="contain"
          />
        </Center>
        <Center mt="md">
          <Text size="xl" fw={600} c="dark.7">
            Bem-vindo!
          </Text>
        </Center>
        <Stack align="center" gap="md" mt="lg">
          <Text size="sm" c="dimmed" ta="center">
            Entre com sua conta Google para continuar.
          </Text>
          {googleClientId ? (
            <Button
              onClick={() => googleLogin()}
              variant="outline"
              color="dark"
              leftSection={
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              }
              size="lg"
              radius="xl"
              fullWidth
              styles={{
                root: {
                  height: 48,
                  '&:hover': {
                    backgroundColor: 'var(--mantine-color-gray-0)',
                  },
                },
              }}
            >
              Continuar com Google
            </Button>
          ) : (
            <Button variant="outline" color="teal" disabled>
              Configure REACT_APP_GOOGLE_CLIENT_ID
            </Button>
          )}
        </Stack>
        <Center mt="xl">
          <Text size="xs" c="dimmed">
            <Anchor component={Link} to="/privacy" c="dimmed" size="xs">
              Política de Privacidade
            </Anchor>
            {' | '}
            <Anchor component={Link} to="/terms" c="dimmed" size="xs">
              Termos de Uso
            </Anchor>
          </Text>
        </Center>
      </Card>
    </Box>
  );
}

export default Login;
