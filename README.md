# Movie Explorer

**Türkçe | [English](#english)**

Movie Explorer, OMDb API'sini kullanarak film ve diziler hakkında bilgi alabileceğiniz bir React projesidir. Kullanıcılar, arama yaparak veya filtreleme seçeneklerini kullanarak istedikleri içerikleri kolayca bulabilir.

## Özellikler

- **Arama Özelliği**: Film ve dizileri isimlerine göre arayabilirsiniz.
- **Filtreleme**: Tür, yıl ve IMDb puanına göre içerikleri filtreleyebilirsiniz.
- **Karanlık / Aydınlık Tema**: Kullanıcı dostu bir tema seçeneği sunar.

## Gereksinimler

Bu projeyi çalıştırmak için aşağıdaki yazılımların bilgisayarınızda kurulu olması gerekir:

- [Node.js](https://nodejs.org/) (>=14.x)
- [npm](https://www.npmjs.com/) veya [yarn](https://yarnpkg.com/)

## Kurulum

1. Projeyi bilgisayarınıza klonlayın:

   ```bash
   git clone https://github.com/MusabBayram/movie-case.git
   cd movie-case
   ```

2. Gerekli bağımlılıkları yükleyin:

   ```bash
   npm install
   ```

3. [OMDb API](https://www.omdbapi.com/) üzerinden bir API anahtarı alın ve `.env` dosyasını oluşturun:

   ```plaintext
   REACT_APP_OMDB_API_KEY=your_api_key_here
   ```

4. `.env` dosyasını proje kök dizinine ekleyin.

## Kullanım

Projeyi yerel ortamda başlatmak için şu komutu çalıştırın:

```bash
npm start
```

Uygulama, [http://localhost:3000](http://localhost:3000) adresinde açılacaktır.

## Yapılandırma

OMDb API anahtarını güncellemek veya değiştirmek için `.env` dosyasını düzenleyin:

```plaintext
REACT_APP_OMDB_API_KEY=your_new_api_key
```

## Build

Projeyi üretim ortamına hazırlamak için şu komutu çalıştırın:

```bash
npm run build
```

Bu komut, projeyi optimize edilmiş bir şekilde `build` klasörüne aktarır.

## Lisans

Bu proje MIT lisansı altında yayınlanmıştır. Daha fazla bilgi için `LICENSE` dosyasına göz atabilirsiniz.

---

# English

Movie Explorer is a React project that uses the OMDb API to fetch information about movies and series. Users can easily find the content they want by searching or using filtering options.

## Features

- **Search Feature**: Search for movies and series by their names.
- **Filtering**: Filter content by type, year, and IMDb rating.
- **Dark/Light Theme**: Provides a user-friendly theme toggle option.

## Requirements

To run this project, you need to have the following installed on your computer:

- [Node.js](https://nodejs.org/) (>=14.x)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Setup

1. Clone the project to your local machine:

   ```bash
   git clone https://github.com/MusabBayram/movie-case.git
   cd movie-case
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Get an API key from [OMDb API](https://www.omdbapi.com/) and create a `.env` file:

   ```plaintext
   REACT_APP_OMDB_API_KEY=your_api_key_here
   ```

4. Place the `.env` file in the root directory of the project.

## Usage

To start the project in your local environment, run:

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

## Configuration

To update or change the OMDb API key, edit the `.env` file:

```plaintext
REACT_APP_OMDB_API_KEY=your_new_api_key
```

## Build

To prepare the project for production, run:

```bash
npm run build
```

This command optimizes the project and outputs it to the `build` folder.

## License

This project is licensed under the MIT License. For more information, see the `LICENSE` file.