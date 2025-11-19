import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

/*
ver isso aq
// No arquivo principal do back-end (ex: index.js ou main.ts)
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173'
}));

// --- MODIFICAÇÃO AQUI ---
app.get('/api/docentes', (req, res) => {
  console.log('Endpoint /api/docentes chamado!'); // Para ter certeza que a chamada chegou

  // Em vez de buscar no banco, criamos uma lista "na mão"
  const mockDocentes = [
    { id: 1, name: "Prof. Mock Silva", email: "silva@unicamp.br" },
    { id: 2, name: "Profa. Mock Souza", email: "souza@unicamp.br" },
    { id: 3, name: "Prof. Mock Pereira", email: "pereira@unicamp.br" }
  ];

  // Retornamos a lista falsa
  res.json(mockDocentes);
});
// -------------------------

app.listen(3000, () => {
  console.log('Back-end rodando na porta 3000 com dados mockados!');
});


*/