A prototype player meant for remote meetings. Made with [Electron JS](https://www.electronjs.org/).

## Development

```
npm install
npm start
```

## Compile

```
npm run package # check the out file
```

## Running tests

```
npm test
```

## Linting

```
./node_modules/.bin/prettier --write src test
```



## Usage

Create a file under your `$HOME/.config/jw-play/config.json` with similar configuration:

```json
{
  "directories": [
    "/Users/mjacobus/Projects/reunioes/_arquivos"
  ]
}
```

## Screenshots

![Opening the app](https://user-images.githubusercontent.com/226834/112857341-22935e00-9087-11eb-99a4-8834e4a9956b.png)

----

![When selecting a vídeo](https://user-images.githubusercontent.com/226834/112857346-23c48b00-9087-11eb-8772-2a3e6c2e2757.png)

----

![When nothing is selected](https://user-images.githubusercontent.com/226834/112857586-61291880-9087-11eb-9682-caeb514ddca3.png)
