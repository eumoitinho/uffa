import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Stack, TextInput, Divider, Button, Center, Image } from '@mantine/core';
import { useForm } from '@mantine/form';
import { getUserById, updateUser, uploadUserPhoto } from '../services/apiService';
import { notifications } from '@mantine/notifications';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';

function Onboarding() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [userData, setUserData] = useState(null);

  const onboardingForm = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Seu nome precisa ter mais de duas letras' : null),
    },
  });

  const loggedUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!loggedUser?.id) {
          return;
        }
        const userDataFromApi = await getUserById(loggedUser.id);
        setUserData(userDataFromApi);
        onboardingForm.setValues({
          name: userDataFromApi.name || '',
        });
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };

    fetchUserData();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhotoFile(file);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    onboardingForm.validate();
    if (!onboardingForm.isValid()) {
      return;
    }

    try {
      dispatch(ShowLoading());

      const userId = loggedUser.id;

      if (selectedPhotoFile) {
        try {
          await uploadUserPhoto(userId, selectedPhotoFile);
        } catch (photoError) {
          console.log('Erro ao fazer upload da foto:', photoError);
        }
      }

      await updateUser(userId, { name: onboardingForm.values.name });

      const updatedUser = await getUserById(userId);
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          photo: updatedUser.photo,
        })
      );
      localStorage.removeItem('needsOnboarding');

      notifications.show({
        id: 'onboarding-ok',
        message: 'Perfil configurado com sucesso!',
        color: 'teal',
      });

      navigate('/');
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      console.log(error);
      notifications.show({
        id: 'onboarding-erro',
        message: 'Oops! Algo deu errado :(',
        color: 'red',
      });
    }
  };

  return (
    <div className="flex h-screen justify-center items-center">
      <Card
        sx={{
          width: 400,
          padding: 'sm',
        }}
        shadow="lg"
        withborder
      >
        <Center>
          <Image
            src={process.env.PUBLIC_URL + '/logo-png.png'}
            alt="Logo"
            height={45}
            width={100}
          />
        </Center>
        <Center>
          <h1>Bem-vindo!</h1>
        </Center>
        <Divider variant="dotted" color="gray" />
        <form action="" onSubmit={onSubmit}>
          <Stack>
            <TextInput
              label="Nome"
              placeholder="Como você quer ser chamado?"
              name="name"
              {...onboardingForm.getInputProps('name')}
            />
            <label>
              Foto (opcional):
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
            </label>
            {(selectedPhotoFile || userData?.photo) && (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden' }}>
                <img
                  src={selectedPhotoFile ? URL.createObjectURL(selectedPhotoFile) : userData?.photo}
                  alt="Perfil"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <Button type="submit" variant="outline" color="teal">
              Finalizar
            </Button>
          </Stack>
        </form>
      </Card>
    </div>
  );
}

export default Onboarding;
