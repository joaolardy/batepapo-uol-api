# API chat UOL

Este é um projeto de back-end que cria uma API para um chat usando MongoDB e Node.js. O projeto tem como objetivo fornecer uma interface simples e fácil de usar para desenvolvedores que desejam implementar uma funcionalidade de chat em suas aplicações.

## Tecnologias Utilizadas
- Node.js
- MongoDB

## Rodando em sua máquina
Para começar com este projeto, você precisará ter Node.js e MongoDB instalados em seu sistema. Depois de tê-los instalados, você pode seguir estas etapas:

1. Clone o repositório para sua máquina local.
2. Instale as dependências usando `npm install`.
3. Crie um arquivo `.env` na raiz do projeto e adicione sua string de conexão do MongoDB. Deve ficar parecido com isso: `MONGODB_URL=mongodb://localhost/chat`.
4. Execute o projeto usando `npm start`.



## ✅ Requisitos do projeto

- Geral
    - [ ]  A porta utilizada pelo seu servidor deve ser a **5000**.
    - [ ]  Versionamento usando Git é obrigatório, crie um **repositório público** no seu perfil do GitHub **apenas com o código do backend.**
    - [ ]  Faça commits a cada funcionalidade implementada.
    - [ ]  **Utilize dotenv.**
    - [ ]  Não esqueça de criar o `.gitignore`: a `node_modules` e o `.env` não devem ser commitados.
    - [ ]  Seu projeto deve ter, obrigatoriamente, os arquivos `package.json` e `package-lock.json`, que devem estar na raiz do projeto. Eles devem conter todas as **dependências** do projeto.
    - [ ]  Adicione o código que inicia o servidor, com a função `listen`, no arquivo `src/app.js`.
    - [ ]  Adicione um script no `package.json` para iniciar o servidor rodando `npm start` como no exemplo abaixo:
        
        ```json
        // package.json
        {
          //...
          "scripts": {
            //...
            "start": "node ./src/app.js"
          }
        }
        ```
        
- Armazenamento e formato dos dados
    - [ ]  Para persistir os dados (participantes e mensagens), utilize coleções do Mongo com a biblioteca `mongodb`
    - [ ]  O formato de um **participante** deve ser:
        
        ```jsx
        {name: 'João', lastStatus: 12313123} // O conteúdo do lastStatus será explicado nos próximos requisitos
        ```
        
    - [ ]  O formato de uma **mensagem** deve ser:
        
        ```jsx
        {from: 'João', to: 'Todos', text: 'oi galera', type: 'message', time: '20:04:37'}
        ```
        
    - [ ]  Se conecte ao banco usando sempre a variável de ambiente `DATABASE_URL`.
        
        ```jsx
        const mongoClient = new MongoClient(process.env.DATABASE_URL);
        ```

        
    - [ ]  Não adicione nenhum nome customizado para o banco de dados. Use o nome dado pela connection string.
        
        ```jsx
        const db = mongoClient.db();
        ```
        
- **POST** `/participants`
    - [ ]  Deve receber (pelo `body` do request), um parâmetro **name**, contendo o nome do participante a ser cadastrado na sala:
        
        ```jsx
        {
            name: "João"
        }
        ```
        
    - [ ]  As validações deverão ser feitas com a biblioteca `joi`.
        - [ ]  **name** deve ser string não vazia (caso algum erro seja encontrado, retornar **status 422**).
    - [ ]  Impeça o cadastro de um nome que já está sendo usado (caso exista, retornar **status 409**).
    - [ ]  Salvar o participante na coleção de nome `participants` com o MongoDB, no formato:
        
        ```jsx
        {
        		name: 'xxx',
        		lastStatus: Date.now()
        }
        ```
    - [ ]  Salvar com o MongoDB uma mensagem na collection `messages` com o seguinte formato:
        
        ```jsx
        { 
        		from: 'xxx',
        		to: 'Todos',
        		text: 'entra na sala...',
        		type: 'status',
        		time: 'HH:mm:ss'
        }
        ```
        
        - `xxx` deve ser substituído pelo nome do usuário que acabou de entrar na sala.
        - Para gerar o horário nesse formato, utilize a biblioteca `dayjs`.
    - [ ]  Por fim, em caso de sucesso, retornar **status 201**. Não é necessário retornar nenhuma mensagem além do status.
    
- **GET** `/participants`
    - [ ]  Retornar a lista de todos os participantes.
    - [ ]  Caso não haja nenhum participante na sala, o retorno deve ser um array vazio.
- **POST** `/messages`
    - [ ]  Deve receber (pelo `body` da request), os parâmetros `to`, `text` e `type`:
        
        ```jsx
        {
            to: "Maria",
            text: "oi sumida rs",
            type: "private_message"
        }
        ```
        
    - [ ]  Já o `from` da mensagem, ou seja, o remetente, **não será enviado pelo body**. Será enviado pelo cliente através de um **header** na requisição chamado `User`.
    - [ ]  Validar: (caso algum erro seja encontrado, retornar **status 422**).
        - [ ]  **to** e **text** devem ser strings não vazias.
        - [ ]  **type** só pode ser `message` ou `private_message`.
        - [ ]  **from** é obrigatório e deve ser um participante existente na lista de participantes (ou seja, que está na sala).
    - [ ]  As validações deverão ser feitas com a biblioteca `joi`, com exceção da validação de um participante existente na lista de participantes (use as funções do MongoDB para isso).
    - [ ]  Ao salvar essa mensagem, deve ser acrescentado o atributo **time**, contendo a hora atual no formato HH:mm:ss (utilize a biblioteca `dayjs`).
    - [ ]  Salve a mensagem na collection de nome `messages` com o formato proposto na seção de armazenamento de dados.
    - [ ]  Por fim, em caso de sucesso, retornar **status 201**. Não é necessário retornar nenhuma mensagem além do status.
- **GET** `/messages`
    - [ ]  Retornar as mensagens:
        - [ ]  O back-end só deve entregar as mensagens que aquele usuário poderia ver. Ou seja: deve entregar todas as mensagens **públicas,** todas as mensagens com o remetente ****`“Todos”` ****e todas as mensagens privadas enviadas para ele (`to`) ou por ele (`from`).
        - [ ]  Para isso, o cliente envia um header `User` para identificar quem está fazendo a requisição.
        - 🔥 Dica: pesquise sobre o operador `$or` do MongoDB.
    - [ ]  Essa rota deve aceitar um parâmetro via **query string** (o que vem após a interrogação numa URL), indicando a quantidade de mensagens que o cliente gostaria de obter. Esse parâmetro deve se chamar `limit`. Ou seja, o request do cliente será feito pra URL:
        
        ```jsx
        http://localhost:5000/messages?limit=100
        ```
        
        - [ ]  Caso não seja informado um `limit`, todas as mensagens devem ser retornadas.
        - [ ]  Caso tenha sido fornecido um `limit`, por exemplo 100, somente as últimas 100 mensagens mais recentes devem ser retornadas.
        - [ ]  Caso o limite seja um valor inválido (0, negativo ou string não numérica), deve retornar o **status 422**.
- **POST** `/status`
    - [ ]  Deve receber por um **header** na requisição, chamado `User`, contendo o nome do participante a ser atualizado.
    - [ ]  Caso este header não seja passado, retorne o **status 404**.
    - [ ]  Caso este participante não conste na lista de participantes, deve ser retornado um **status 404.** Nenhuma mensagem precisa ser retornada além do status.
    - [ ]  Atualizar o atributo **lastStatus** do participante informado para o timestamp atual, utilizando `Date.now()`.
    - [ ]  Por fim, em caso de sucesso, retornar **status 200.**
- Remoção automática de usuários inativos
    - [ ]  A cada 15 segundos, remova da lista de participantes os participantes que possuam um **lastStatus** de mais de 10 segundos atrás.
    - [ ]  Para cada participante removido, salve uma nova mensagem no banco, no formato:
        
        ```jsx
        { 
        	from: 'xxx',
        	to: 'Todos',
        	text: 'sai da sala...',
        	type: 'status',
        	time: 'HH:mm:ss'
        }
        ```
