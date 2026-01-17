import React, { useState } from 'react';
import { Card, Badge, Divider, Stack, Text, Title } from '@mantine/core';
import Header from '../components/header/Header';

function Terms() {
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
            Termos
          </Badge>
          <Title order={2} mt="sm">
            Termos de Uso
          </Title>
          <Text size="sm" color="dimmed">
            Última atualização: 2026-01-12
          </Text>
          <Divider my="md" />
          <Stack spacing="sm">
            <Text>
              Ao acessar o UFFA, você concorda em usar o serviço de forma lícita e responsável.
              É sua responsabilidade manter a confidencialidade da sua conta Google.
            </Text>
            <Text>
              O UFFA oferece ferramentas de organização financeira e não substitui orientação
              profissional. As informações apresentadas têm caráter informativo.
            </Text>
            <Text>
              Você é responsável pelos dados cadastrados no aplicativo. Conteúdos ilegais,
              abusivos ou que violem direitos de terceiros são proibidos.
            </Text>
            <Text>
              Podemos atualizar funcionalidades, termos e políticas a qualquer momento para
              melhorar o serviço ou atender requisitos legais.
            </Text>
            <Text>
              O uso contínuo após alterações implica concordância com os novos termos.
            </Text>
          </Stack>
        </Card>
      </div>
    </div>
  );
}

export default Terms;
