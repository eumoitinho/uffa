import React from 'react';
import { Text, Stack, Group, ThemeIcon } from '@mantine/core';
import { IconWallet, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';

export const Balance = ({ transactions }) => {
  const { income = 0, expense = 0 } = transactions.reduce(
    (acc, transaction) => {
      const amount = Number(transaction.amount.replace(/[^\d.-]/g, ''));
      if (transaction.type === 'Gasto') {
        acc.expense += amount;
      } else if (transaction.type === 'Renda') {
        acc.income += amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const balance = income - expense;

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const isPositive = balance >= 0;

  return (
    <Stack gap="md" align="center">
      <Group gap="xs">
        <ThemeIcon
          size="lg"
          radius="xl"
          variant="light"
          color={isPositive ? 'teal' : 'red'}
        >
          <IconWallet size={20} />
        </ThemeIcon>
        <Text size="sm" c="dimmed" fw={500}>
          Seu saldo
        </Text>
      </Group>

      <Text
        size="2.5rem"
        fw={700}
        c={isPositive ? 'teal.7' : 'red.6'}
        style={{ letterSpacing: '-0.02em' }}
      >
        {formatCurrency(balance)}
      </Text>

      <Group gap="xl" mt="xs">
        <Group gap="xs">
          <ThemeIcon size="sm" radius="xl" variant="light" color="teal">
            <IconTrendingUp size={14} />
          </ThemeIcon>
          <div>
            <Text size="xs" c="dimmed">Receitas</Text>
            <Text size="sm" fw={600} c="teal.7">{formatCurrency(income)}</Text>
          </div>
        </Group>

        <Group gap="xs">
          <ThemeIcon size="sm" radius="xl" variant="light" color="red">
            <IconTrendingDown size={14} />
          </ThemeIcon>
          <div>
            <Text size="xs" c="dimmed">Despesas</Text>
            <Text size="sm" fw={600} c="red.6">{formatCurrency(expense)}</Text>
          </div>
        </Group>
      </Group>
    </Stack>
  );
};

export default Balance;
