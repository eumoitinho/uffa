import React, { useState } from 'react';
import { Card, Badge, Divider, Stack, Text, Title } from '@mantine/core';
import Header from '../components/header/Header';

function Privacy() {
  const [sidebar, setSidebar] = useState(false);

  return (
    <div>
      <Header sidebar={sidebar} setSidebar={setSidebar} />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 16px' }}>
        <Card
          shadow="lg"
          withBorder
          sx={{ width: 900, maxWidth: '95%', padding: '24px' }}
        >
          <Badge color="teal" variant="light" radius="xl">
            Privacidade
          </Badge>
          <Title order={2} mt="sm">
            Política de Privacidade
          </Title>
          <Text size="sm" color="dimmed">
            Última atualização: 2026-01-12
          </Text>
          <Divider my="md" />
          <Stack spacing="sm">
            <Text>
              Esta política descreve como o UFFA coleta, usa e protege seus dados pessoais.
              Ao utilizar o aplicativo, você concorda com as práticas descritas aqui.
            </Text>
            <Text>
              Coletamos dados necessários para criar sua conta e operar os recursos do app,
              como nome, e-mail, foto de perfil e suas transações financeiras.
            </Text>
            <Text>
              Usamos seus dados para autenticação, personalização, suporte e melhorias do serviço.
              Não vendemos suas informações e compartilhamos dados apenas quando exigido por lei
              ou com sua autorização.
            </Text>
            <Text>
              As informações de uso offline podem ficar armazenadas no seu dispositivo
              (IndexedDB) para garantir funcionamento sem internet.
            </Text>
            <Text>
              Você pode solicitar atualização ou exclusão de dados através dos canais de suporte
              disponíveis no aplicativo.
            </Text>
          </Stack>
        </Card>
      </div>
    </div>
  );
}

export default Privacy;
