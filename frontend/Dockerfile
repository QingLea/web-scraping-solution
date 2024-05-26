FROM node:18-alpine
RUN npm install -g pnpm
WORKDIR /usr/src/app
COPY package.json ./
RUN pnpm install --prod
COPY . .
ENV BACKEND_URL=http://backend:8000
RUN pnpm run build
CMD [ "pnpm", "start" ]
EXPOSE 3000
