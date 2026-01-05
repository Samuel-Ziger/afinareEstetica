# Instruções para Configurar as Regras do Firestore

## Problema
O erro "Missing or insufficient permissions" ocorre porque as regras de segurança do Firestore não estão configuradas para permitir que usuários autenticados escrevam na coleção de serviços.

## Solução

### Opção 1: Deploy das Regras via Firebase CLI (Recomendado)

1. **Instale o Firebase CLI** (se ainda não tiver):
   ```bash
   npm install -g firebase-tools
   ```

2. **Faça login no Firebase**:
   ```bash
   firebase login
   ```

3. **Faça o deploy das regras**:
   ```bash
   npm run deploy:rules
   ```
   
   Ou diretamente:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Opção 2: Configurar Manualmente no Console do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione o projeto "afinare-estetica"
3. Vá em **Firestore Database** > **Regras**
4. Cole o seguinte conteúdo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para agendamentos - qualquer um pode criar, apenas autenticados podem ler
    match /agendamentos/{agendamentoId} {
      allow create: if request.auth != null || request.auth == null; // Permite criação sem autenticação
      allow read, update, delete: if request.auth != null; // Apenas autenticados podem ler/atualizar/deletar
    }
    
    // Regras para serviços - apenas autenticados podem ler e escrever
    match /servicos/{servicoId} {
      allow read: if request.auth != null || request.auth == null; // Permite leitura pública
      allow create, update, delete: if request.auth != null; // Apenas autenticados podem escrever
    }
    
    // Regras para combos - apenas autenticados podem ler e escrever
    match /combos/{comboId} {
      allow read: if request.auth != null || request.auth == null; // Permite leitura pública
      allow create, update, delete: if request.auth != null; // Apenas autenticados podem escrever
    }
    
    // Regras para cursos - apenas autenticados podem ler e escrever
    match /cursos/{cursoId} {
      allow read: if request.auth != null || request.auth == null; // Permite leitura pública
      allow create, update, delete: if request.auth != null; // Apenas autenticados podem escrever
    }
    
    // Regras para configurações - apenas autenticados podem ler e escrever
    match /config/{configId} {
      allow read: if request.auth != null || request.auth == null; // Permite leitura pública
      allow create, update, delete: if request.auth != null; // Apenas autenticados podem escrever
    }
    
    // Regras para usuários - apenas o próprio usuário pode ler/escrever
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. Clique em **Publicar**

## Após Configurar as Regras

1. Recarregue a página do painel administrativo
2. Clique no botão "Inicializar Serviços Padrão"
3. Os serviços devem ser criados com sucesso

## Verificação

Para verificar se as regras foram aplicadas corretamente:
- Tente criar um serviço no painel administrativo
- Se funcionar, as regras estão corretas
- Se ainda der erro, verifique se você está logado como administrador
