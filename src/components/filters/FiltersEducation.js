import { Group, Select } from '@mantine/core'
import React from 'react'

function FiltersEducation({ setFilters, filters, getData}) {
  return (
    <Group grow>
      <Select
        label='Selecione o assunto'
        placeholder='Selecione o assunto'
        dropdownPosition="bottom"
        data={[
          { label: 'Todos', value: 'all' },
          { label: 'Emprestimos', value: 'Emprestimos' },
          { label: 'Consumo', value: 'Consumo' },
          { label: 'Juros & Impostos', value: 'Juros & Impostos' },
          { label: 'Economizando', value: 'Economizando' },
          { label: 'Banco', value: 'Banco' },
          { label: 'Receitas', value: 'Receitas' },
          { label: 'Despesas', value: 'Despesas' },
          { label: 'Cartões', value: 'Cartões' },
        ]}
        value={filters.subject}
        onChange={(value) => setFilters({ ...filters, subject: value })}
        name='subject'
      />
    </Group>
  )
}

export default FiltersEducation