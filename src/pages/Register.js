import React, { useState } from 'react';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Stack, TextInput, Divider, Button } from '@mantine/core';
import { registerUser, uploadUserPhoto } from '../services/apiService';
import { notifications } from '@mantine/notifications';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';
import { Center, Image } from '@mantine/core';

function Register() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const registerform = useForm({
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

    const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhotoFile(file);
    }
  };

 const onSubmit = async (event) => {
  event.preventDefault();

  try {
    dispatch(ShowLoading());

    // Preparar dados do usuário
    const userData = {
      name: registerform.values.name,
      email: registerform.values.email,
      password: registerform.values.password,
    };

    // Registrar usuário via API
    const response = await registerUser(userData);

    if (response && response.user) {
      // Se houver foto selecionada, fazer upload
      if (selectedPhotoFile && response.user.id) {
        try {
          await uploadUserPhoto(response.user.id, selectedPhotoFile);
        } catch (photoError) {
          console.log('Erro ao fazer upload da foto:', photoError);
        }
      }

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
      });
    }
    dispatch(HideLoading());
  } catch (error) {
    dispatch(HideLoading());
    console.log(error);

    if (error.response?.status === 409) {
      notifications.show({
        id: 'Usuário já cadastrado',
        message: 'Usuário já cadastrado',
        color: "red",
      });
    } else {
      notifications.show({
        id: 'erro-oops',
        message: 'Oops! Algo deu errado :(',
        color: "red",
      });
    }
  }
};

    return (
        <div className="flex h-screen justify-center items-center">
            <Card sx={{
                width: 400,
                padding: "sm",
            }}
                shadow="lg"
                withborder
            >
                <Center>
                    <Image
                        src={process.env.PUBLIC_URL + '/logo-png.png'} alt="Logo"
                        height={45}
                        width={100}
                    />
                </Center>
                <Center>
                    <h1>Registre-se</h1>
                </Center>
                <Divider variant='dotted' color='gray' />
                <form action="" onSubmit={onSubmit}>
                    <Stack>
                        <TextInput
                            label="Nome"
                            placeholder="Digite seu nome"
                            name="name"
                            {...registerform.getInputProps("name")}
                        />
                        <TextInput
                            label="E-mail"
                            placeholder="Digite seu e-mail"
                            name="email"
                            {...registerform.getInputProps("email")}
                        />
                        <TextInput
                            label="Senha"
                            placeholder="Digite sua senha"
                            name="password"
                            type="password"
                            {...registerform.getInputProps("password")}
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
