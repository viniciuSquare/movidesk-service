# MoviDesk API Service

## Descrição

API para consumir tickets da plataforma MoviDesk.

Com ele é possível criar, editar e buscar chamados, assim como persistir seus metadados em Banco de Dados, hoje com objetivo da criação de Dashboards gerenciais no Grafana.

# Executando o serviço

É necessário definir as variáveis de ambiente em um arquivo `.env`, siga o exemplo em `.env.example`.

## Executando localmente

Execute os comandos abaixo na primeira vez que for executar

1. Execute `npm install` para instalar as dependências.
2. `npx prisma generate` para gerar o client que se conecta com o banco.
3. Caso necessário criar o banco de dados para se conectar, execute `npx prisma migrate dev` .

Com tudo devidamente funcional, execute `npm run start:dev` para rodar a API.

## Rodando com Docker

É possível executar o serviço usando a imagem disponível no [Docker Hub](https://hub.docker.com/repository/docker/viniciusquare/quiver_movidesk_service/general).
Os arquivos da aplicação estão em `/usr/app` e o serviço ouvindo à porta `3000`

- Exemplo de `docker-compose.yml` serviço:
  ```yml
    aws_capacity_service:
      build: ./movidesk-service
      container_name: quiver_movidesk_service
      command: npm run start:dev
      ports:
        - "3000:3000"
      volumes:
        - ./movidesk-service:/usr/app
      environment:
        - DATABASE_URL=mysql://user:password@host:3306/movidesk?pool_timeout=0
        - MOVIDESK_TOKEN=
        - MOVIDESK_URL=https://api.movidesk.com/public/v1/tickets
  ```
