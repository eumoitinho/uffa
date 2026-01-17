import React, { useState } from 'react';
import { Card, Badge, Divider, Stack, Text, Title } from '@mantine/core';
import Header from '../components/header/Header';

function OpenFinance() {
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
            Open Finance
          </Badge>
          <Title order={2} mt="sm">
            Termos de Open Finance
          </Title>
          <Text size="sm" color="dimmed">
            Última atualização: 2026-01-12
          </Text>
          <Divider my="md" />
          <Stack spacing="sm">
            <Text>
              O UFFA pode oferecer integrações com Open Finance. Essas integrações são opcionais
              e dependem do seu consentimento explícito.
            </Text>
            <Text>
              Ao autorizar uma conexão, você permite o compartilhamento de dados financeiros
              necessários para consolidar saldos, transações e insights dentro do aplicativo.
            </Text>
            <Text>
              Você pode revogar o consentimento a qualquer momento, desativando a integração.
              Após a revogação, novos dados não serão coletados.
            </Text>
            <Text>
              As integrações seguem as regras do ecossistema Open Finance e utilizam canais
              seguros para transmissão de dados.
            </Text>
          </Stack>
        </Card>
      </div>
    </div>
  );
}

export default OpenFinance;
