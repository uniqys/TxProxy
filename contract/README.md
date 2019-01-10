## Development

### Setup & Migrate

```sh
cd /path/to/QuraPay/contract
yarn install
yarn migrate
```

### Test

```sh
yarn test
```

### TIPS

#### デプロイされたコントラクトを更新したい

```sh
yarn migrate --reset
```

#### 全ファイルをコンパイルし直したい

```sh
yarn build --all
```

