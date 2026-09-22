require('dotenv/config');
const { PrismaClient } = require('../dist/src/generated/prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const prisma = new PrismaClient({ adapter });

// usuario_id 2 = "Carlos Corretor" cadastrado no auth-api (corretor logado responsável pelos cadastros)
const USUARIO_ID_CORRETOR = 2n;

async function criarLocador(params) {
  await prisma.locador.upsert({
    where: { id: params.id },
    update: {},
    create: {
      id: params.id,
      usuario_id: USUARIO_ID_CORRETOR,
      tipo_pessoa: params.tipo,
      email: params.email,
      status: params.status,
      endereco_locador: { create: { ...params.endereco } },
      locador_pessoa_fisica: params.pessoaFisica
        ? { create: { ...params.pessoaFisica } }
        : undefined,
      locador_pessoa_juridica: params.pessoaJuridica
        ? { create: { ...params.pessoaJuridica } }
        : undefined,
    },
  });
}

async function main() {
  await criarLocador({
    id: 1n,
    email: 'joao.almeida@email.com',
    tipo: 'FISICA',
    status: 'ATIVO',
    endereco: {
      logradouro: 'Rua das Palmeiras',
      numero: '120',
      bairro: 'Centro',
      cidade: 'Curitiba',
      estado: 'PR',
      cep: '80010-000',
    },
    pessoaFisica: { nome: 'João Pedro Almeida', cpf: '12345678901', rg: '12345678' },
  });

  await criarLocador({
    id: 2n,
    email: 'contato@silvaimoveis.com',
    tipo: 'JURIDICA',
    status: 'ATIVO',
    endereco: {
      logradouro: 'Av. Sete de Setembro',
      numero: '4500',
      complemento: 'Sala 12',
      bairro: 'Batel',
      cidade: 'Curitiba',
      estado: 'PR',
      cep: '80240-000',
    },
    pessoaJuridica: {
      razao_social: 'Silva Imóveis Ltda',
      cnpj: '12345678000190',
      inscricao_estadual: '1234567890',
    },
  });

  await criarLocador({
    id: 3n,
    email: 'fernanda.costa@email.com',
    tipo: 'FISICA',
    status: 'ATIVO',
    endereco: {
      logradouro: 'Rua XV de Novembro',
      numero: '850',
      bairro: 'Centro',
      cidade: 'Curitiba',
      estado: 'PR',
      cep: '80020-310',
    },
    pessoaFisica: { nome: 'Fernanda Costa', cpf: '98765432100', rg: '87654321' },
  });

  await criarLocador({
    id: 4n,
    email: 'roberto.lima@email.com',
    tipo: 'FISICA',
    status: 'INATIVO',
    endereco: {
      logradouro: 'Rua Marechal Deodoro',
      numero: '300',
      bairro: 'São Francisco',
      cidade: 'Curitiba',
      estado: 'PR',
      cep: '80510-030',
    },
    pessoaFisica: { nome: 'Roberto Lima', cpf: '11122233344', rg: '11223344' },
  });

  console.log('Seed concluído: api-locador');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
