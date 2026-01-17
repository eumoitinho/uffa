import React, { useState } from 'react';
import { Card, Badge, Divider, Stack, Text, Title } from '@mantine/core';
import Header from '../components/header/Header';

function Lgpd() {
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
            LGPD
          </Badge>
          <Title order={2} mt="sm">
            Tratamento de Dados (LGPD)
          </Title>
          <Text size="sm" color="dimmed">
            Última atualização: 2026-01-12
          </Text>
          <Divider my="md" />
          <Stack spacing="sm">
            <Text>
              O UFFA trata dados pessoais conforme a Lei Geral de Proteção de Dados (Lei 13.709/18).
              O tratamento ocorre com base no consentimento e no legítimo interesse para operação
              do aplicativo.
            </Text>
            <Text>
              Seus direitos incluem confirmação de tratamento, acesso, correção, anonimização,
              portabilidade, eliminação e revogação de consentimento.
            </Text>
            <Text>
              Mantemos medidas técnicas e administrativas para proteger seus dados contra acesso
              não autorizado, perda ou alteração indevida.
            </Text>
            <Text>
              Para exercer seus direitos ou esclarecer dúvidas, utilize os canais de contato
              disponíveis no aplicativo.
            </Text>
          </Stack>
        </Card>
      </div>
    </div>
  );
}

export default Lgpd;
