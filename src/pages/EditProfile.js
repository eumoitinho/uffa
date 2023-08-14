import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Stack, TextInput, Divider, Button, Center } from '@mantine/core';
import Header from '../components/header/Header';
import { useForm } from '@mantine/form';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDoc, updateDoc, doc } from 'firebase/firestore';
import cryptojs from "crypto-js";
import { fireDb } from '../firebaseConfig';
import { useDispatch } from 'react-redux';
import { notifications } from '@mantine/notifications';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';
import { getDataUserFromFirebase } from '../services/firebaseService';
import { FaPencilAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

function EditProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userDataLoaded, setUserDataLoaded] = useState(false); // Estado para controlar se os dados do usuário já foram carregados

  const editform = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Seu nome precisa ter mais de duas letras' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'),
    },
  });
  const loggedUser = JSON.parse(localStorage.getItem('user'));
  console.log(loggedUser.id);

  const decryptPassword = (encryptedPassword) => {
    const bytes = cryptojs.AES.decrypt(encryptedPassword, "uffa");
    return bytes.toString(cryptojs.enc.Utf8);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userDataFromFirebase = await getDataUserFromFirebase(loggedUser.id);
      console.log(userDataFromFirebase);
      const decryptedUserData = {
        ...userDataFromFirebase[0],
        password: decryptPassword(userDataFromFirebase[0].password), // Descriptografar a senha
      };
      setUserData(decryptedUserData);
      editform.setValues(decryptedUserData);
      setUserDataLoaded(true);
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
  
    try {
      // Atualizar os dados do usuário no Firestore
      dispatch(ShowLoading());
  
      // Obter o ID do usuário logado
      const userId = loggedUser.id;
  
      // Verificar se o usuário deseja atualizar a foto de perfil
      if (selectedPhotoFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `user_photos/${editform.values.email}`);
        await uploadBytes(storageRef, selectedPhotoFile);
        const photoUrl = await getDownloadURL(storageRef);
  
        // Atualizar a URL da foto no Firestore
        await updateDoc(doc(fireDb, 'users', userId), {
          photo: photoUrl,
        });
      }
  
      // Caso não haja uma nova foto selecionada, apenas atualizar os outros dados no Firestore
      const dataToUpdate = {};
  
      // Verificar quais campos foram alterados pelo usuário e incluir no objeto a ser atualizado
      if (editform.values) {
        Object.keys(editform.values).forEach((key) => {
          // Verificar se o valor atual é diferente do valor original e se o campo não é senha ou foto
          if (editform.values[key] !== loggedUser[key] && key !== 'password' && key !== 'photo') {
            // Adicione apenas os campos que foram alterados e que não sejam senha ou foto
            dataToUpdate[key] = editform.values[key];
          }
        });
      }
  
      // Verificar se a senha foi preenchida e incluir no objeto a ser atualizado
      if (editform.values.password) {
        // Se a senha foi preenchida, criptografa-a antes de atualizar
        dataToUpdate.password = cryptojs.AES.encrypt(
          editform.values.password,
          "uffa"
        ).toString();
      }
  
      await updateDoc(doc(fireDb, 'users', userId), dataToUpdate);
  
      // Obter os dados atualizados do usuário do Firestore
      const userDocRef = doc(fireDb, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        const updatedUserData = userDocSnap.data();
  
        // Atualizar o localStorage apenas com o ID, nome e email do usuário
        const dataToPutInLocalStorage = {
          id: userId,
          name: updatedUserData.name,
          email: updatedUserData.email,
        };
        localStorage.setItem("user", JSON.stringify(dataToPutInLocalStorage));
      }
  
      navigate("/");
  
      notifications.show({
        id: 'Perfil atualizado',
        message: 'Perfil atualizado com sucesso!',
        color: 'teal',
      });
  
      dispatch(HideLoading());
      navigate('/'); // Redirecionar de volta à página de perfil após a atualização
    } catch (error) {
      dispatch(HideLoading());
      console.log(error);
      notifications.show({
        id: 'erro-oops',
        message: 'Oops! Algo deu errado :(',
        color: 'red',
      });
    }
  };
  

  const [sidebar, setSidebar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [photoChanged, setPhotoChanged] = useState(false);

  // Função para alternar a visibilidade da senha
  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };
  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
    password: false,
  });

  const toggleEditMode = (field) => {
    setEditMode((prevEditMode) => ({
      ...prevEditMode,
      [field]: !prevEditMode[field],
    }));
  };
  const handleEditPhotoClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedPhotoFile(file);
        setPhotoChanged(true);
      }
    };
    input.click();
  };
  return (
    <div>
      <Header sidebar={sidebar} setSidebar={setSidebar} />
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
            <h1>Perfil</h1>
          </Center>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              {/* Campo para exibir a foto de perfil */}
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={selectedPhotoFile ? URL.createObjectURL(selectedPhotoFile) : userData?.photo}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              {/* Ícone de lápis para editar a foto */}
              {!editMode.photo && (
                <Button
                  style={{ position: 'absolute', top: '90%', left: '90%', transform: 'translate(-50%, -50%)', zIndex: 1 }}
                  size="xs"
                  onClick={handleEditPhotoClick}
                  title="Editar foto"
                  variant="transparent"
                >
                  <FaPencilAlt />
                </Button>
              )}
            </div>
          </div>
          {editMode.photo && (
            <>
              <div style={{ textAlign: 'center' }}>
                <label>
                  Foto:
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedPhotoFile(e.target.files[0])}
                  />
                </label>
              </div>
            </>
          )}
          <Divider my="xs" label="Editar perfil" labelPosition="center" />
          <form action="" onSubmit={onSubmit}>
            <Stack>
              <div style={{ position: 'relative' }}>
                <TextInput
                  label="Nome"
                  placeholder="Digite seu nome"
                  name="name"
                  {...editform.getInputProps('name')}
                  disabled={!editMode.name}
                />
                {!editMode.name && (
                  <Button
                    style={{ position: 'absolute', top: 25, right: 8 }}
                    size="xs"
                    onClick={() => toggleEditMode('name')}
                    title="Cancelar edição"
                    variant="transparent"
                  >
                    <FaPencilAlt />
                  </Button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <TextInput
                  label="E-mail"
                  placeholder="Digite seu e-mail"
                  name="email"
                  {...editform.getInputProps('email')}
                  disabled={!editMode.email}
                />
                {!editMode.email && (
                  <Button
                    style={{ position: 'absolute', top: 25, right: 8 }}
                    size="xs"
                    onClick={() => toggleEditMode('email')}
                    title="Cancelar edição"
                    variant="transparent"
                  >
                    <FaPencilAlt />
                  </Button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <TextInput
                  label="Senha"
                  placeholder="Digite sua nova senha (opcional)"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  {...editform.getInputProps('password')}
                  disabled={!editMode.password}
                />
                <Button
                  style={{ position: 'absolute', top: 25, right: 8 }}
                  size="xs"
                  onClick={togglePasswordVisibility}
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  variant="transparent"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
                {!editMode.password && (
                  <Button
                    style={{ position: 'absolute', top: 25, right: 40 }}
                    size="xs"
                    onClick={() => toggleEditMode('password')}
                    title="Cancelar edição"
                    variant="transparent"
                  >
                    <FaPencilAlt />
                  </Button>
                )}
              </div>
              {(editMode.name || editMode.email || editMode.password || photoChanged ) && (
                <>
                  <Button type="submit" variant="outline" color="teal">
                    Salvar
                  </Button>
                  <Button
                    onClick={() => {
                      editform.setValues(userData); // Restaurar valores originais ao cancelar edição
                      toggleEditMode('name');
                      toggleEditMode('email');
                      toggleEditMode('password');
                    }}
                    variant="outline"
                    color="teal"
                    fullWidth
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </Stack>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default EditProfile;
