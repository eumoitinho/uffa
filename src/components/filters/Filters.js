import { Group, Select } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates';
import React from 'react'

function Filters({ setFilters, filters, getData}) {
  return (
    <Group grow>
      <Select
        label='Selecione o periodo'
        placeholder='Selecione o periodo'
        data={[
          { label: 'Última Semana', value: '7' },
          { label: 'Último Mes', value: '30' },
          { label: 'Última Ano', value: '365' },
          { label: 'Definir periodo', value: 'custom-range' },
        ]}
        value={filters.frequency}
        onChange={(value) => setFilters({ ...filters, frequency: value })}
        name='frequency'
      />
      <Select
        label='Selecione o tipo'
        placeholder='Selecione o tipo'
        data={[
          { label: 'Tudo', value: '' },
          { label: 'Gasto', value: 'Gasto' },
          { label: 'Renda', value: 'Renda' },
        ]}
        value={filters.type}
        onChange={(value) => setFilters({ ...filters, type: value })}
        name='type'
      />
      {filters.frequency === 'custom-range' && 
      <DatePickerInput
      type="range"
      label="Selecionte intervalo de periodo"
      placeholder="Selecionte intervalo de periodo"
      value={filters.dateRange}
      onChange={(value) => setFilters({ ...filters, dateRange: value })}
      mx="auto"
      maw={400}
    />}
    </Group>
  )
}

export default Filters