import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Divider, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';
import Header from '../components/header/Header';
import {
  getOpenFinanceLinks,
  getOpenFinanceWidgetToken,
  registerOpenFinanceLink,
  syncOpenFinance,
} from '../services/apiService';

function OpenFinanceConnect() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false);
  const [links, setLinks] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [handledLink, setHandledLink] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      cpf: '',
      cnpj: '',
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'Informe seu nome completo' : null),
      cpf: (value) => (value.replace(/\D/g, '').length === 11 ? null : 'CPF inválido'),
      cnpj: (value) =>
        value && value.replace(/\D/g, '').length !== 14 ? 'CNPJ inválido' : null,
    },
  });

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const loadLinks = async () => {
    try {
      const response = await getOpenFinanceLinks();
      setLinks(response || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  useEffect(() => {
    const link = query.get('link');
    const institution = query.get('institution');
    const state = query.get('state');
    const lastError = query.get('last_encountered_error');

    if (!link && !state && !lastError) {
      return;
    }

    if (state === 'exit' || state === 'error' || lastError) {
      notifications.show({
        id: 'openfinance-exit',
        message: lastError
          ? `Não foi possível concluir: ${lastError}`
          : state === 'error'
          ? 'Ocorreu um erro durante o consentimento.'
          : 'Conexão cancelada antes de concluir o consentimento.',
        color: lastError || state === 'error' ? 'red' : 'yellow',
      });
      navigate('/openfinance/connect', { replace: true });
      return;
    }

    if (link && !handledLink) {
      setHandledLink(true);
      (async () => {
        try {
          dispatch(ShowLoading());
          await registerOpenFinanceLink(link, institution);
          await syncOpenFinance({ linkId: link });
          notifications.show({
            id: 'openfinance-ok',
            message: 'Conta conectada e sincronizada com sucesso!',
            color: 'teal',
          });
          await loadLinks();
        } catch (error) {
          console.log(error);
          notifications.show({
            id: 'openfinance-erro',
            message: 'Não foi possível registrar a conexão Open Finance.',
            color: 'red',
          });
        } finally {
          dispatch(HideLoading());
          navigate('/openfinance/connect', { replace: true });
        }
      })();
    }
  }, [query, handledLink, dispatch, navigate]);

  const handleConnect = async () => {
    const validation = form.validate();
    if (validation.hasErrors) {
      return;
    }

    try {
      setIsConnecting(true);
      dispatch(ShowLoading());

      const payload = {
        name: form.values.name.trim(),
        cpf: form.values.cpf,
      };

      if (form.values.cnpj) {
        payload.cnpj = form.values.cnpj;
      }

      const response = await getOpenFinanceWidgetToken(payload);
      if (response?.widgetUrl) {
        window.location.href = response.widgetUrl;
        return;
      }

      notifications.show({
        id: 'openfinance-token',
        message: 'Não foi possível iniciar o widget Open Finance.',
        color: 'red',
      });
    } catch (error) {
      console.log(error);
      notifications.show({
        id: 'openfinance-token-erro',
        message: 'Erro ao gerar o token do Open Finance.',
        color: 'red',
      });
    } finally {
      dispatch(HideLoading());
      setIsConnecting(false);
    }
  };

  const handleSync = async (linkId) => {
    try {
      setIsSyncing(true);
      dispatch(ShowLoading());
      await syncOpenFinance({ linkId });
      notifications.show({
        id: 'openfinance-sync',
        message: 'Sincronização concluída!',
        color: 'teal',
      });
      await loadLinks();
    } catch (error) {
      console.log(error);
      notifications.show({
        id: 'openfinance-sync-erro',
        message: 'Não foi possível sincronizar agora.',
        color: 'red',
      });
    } finally {
      dispatch(HideLoading());
      setIsSyncing(false);
    }
  };

  return (
    <div>
      <Header sidebar={sidebar} setSidebar={setSidebar} />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 16px' }}>
        <Card shadow="lg" withBorder sx={{ width: 900, maxWidth: '95%', padding: '24px' }}>
          <Badge color="teal" variant="light" radius="xl">
            Open Finance
          </Badge>
          <Title order={2} mt="sm">
            Conectar bancos e cartões
          </Title>
          <Text size="sm" color="dimmed">
            Autorize o acesso aos seus dados via Open Finance para atualizar gastos e entradas
            automaticamente.
          </Text>
          <Divider my="md" />
          <Stack spacing="sm">
            <TextInput
              label="Nome completo"
              placeholder="Digite seu nome"
              {...form.getInputProps('name')}
            />
            <Group grow>
              <TextInput
                label="CPF"
                placeholder="000.000.000-00"
                {...form.getInputProps('cpf')}
              />
              <TextInput
                label="CNPJ (opcional)"
                placeholder="00.000.000/0000-00"
                {...form.getInputProps('cnpj')}
              />
            </Group>
            <Button variant="outline" color="teal" onClick={handleConnect} loading={isConnecting}>
              Conectar Open Finance
            </Button>
          </Stack>

          <Divider my="lg" label="Conexões" labelPosition="center" />
          {links.length === 0 ? (
            <Text size="sm" color="dimmed">
              Nenhuma conexão ativa ainda.
            </Text>
          ) : (
            <Stack spacing="sm">
              {links.map((link) => (
                <Card key={link.id} withBorder shadow="sm" sx={{ padding: '16px' }}>
                  <Group position="apart" align="flex-start">
                    <div>
                      <Text weight={600}>{link.institution || 'Instituição'}</Text>
                      <Text size="xs" color="dimmed">
                        Link: {link.link_id}
                      </Text>
                      <Text size="xs" color="dimmed">
                        Última sincronização: {link.last_synced_at || 'Nunca'}
                      </Text>
                    </div>
                    <Button
                      variant="light"
                      color="teal"
                      onClick={() => handleSync(link.link_id)}
                      loading={isSyncing}
                    >
                      Sincronizar
                    </Button>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Card>
      </div>
    </div>
  );
}

export default OpenFinanceConnect;
