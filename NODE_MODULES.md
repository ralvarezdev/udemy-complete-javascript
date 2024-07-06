# Shrink Node Modules Guide

The first time I bundled the files from Forkify with Parcel, through Node Package Manager (<strong>NPM</strong>), I
ended up with a node_modules folder which had a total size of 200-300MB. That's a <strong>HUGE</strong> size, for just a
single page website... Unbelievable.

This is the way that I saved a lot of disk storage

## Installation

### Install Node Modules Globally

Because these are web pages for learning purposes, and there are multiple modules in common, I decided to install those
packages globally with the following command:

```
npm install -g parcel && npm install -g @parcel/transformer-sass && npm install -g fracty
```

### Link Modules

After that, I changed my current working folder to the path where Forkify files are being stored. There must be
a ```package.json``` file if you cloned this code from my GitHub repository. This is the command that I used to link the
program NPM package with the required external modules which I installed globally:

```
npm link parcel && npm link @parcel/transformer-sass && npm link fracty
```

### Run

Now, you can start the server with ```npm start``` and check the new size of your ```node_modules``` folder