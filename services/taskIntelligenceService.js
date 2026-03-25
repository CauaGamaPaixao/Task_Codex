function generateSubtasks(taskTitle) {
  const normalizedTitle = String(taskTitle || '').trim().toLowerCase();

  if (normalizedTitle.includes('login')) {
    return [
      'Criar endpoint de autenticação',
      'Validar credenciais',
      'Gerar token JWT',
      'Criar middleware de autorização'
    ];
  }

  if (normalizedTitle.includes('bug')) {
    return [
      'Reproduzir erro',
      'Identificar causa',
      'Corrigir problema',
      'Testar solução'
    ];
  }

  if (normalizedTitle.includes('api')) {
    return [
      'Definir endpoints',
      'Implementar controllers',
      'Criar validações',
      'Testar requisições'
    ];
  }

  return [
    'Analisar tarefa',
    'Implementar solução',
    'Testar funcionalidade',
    'Documentar'
  ];
}

function classifyPriority(taskTitle) {
  const normalizedTitle = String(taskTitle || '').trim().toLowerCase();

  if (
    normalizedTitle.includes('erro') ||
    normalizedTitle.includes('falha') ||
    normalizedTitle.includes('crítico')
  ) {
    return 'Alta';
  }

  if (normalizedTitle.includes('melhoria') || normalizedTitle.includes('ajuste')) {
    return 'Média';
  }

  return 'Baixa';
}

module.exports = {
  generateSubtasks,
  classifyPriority
};
