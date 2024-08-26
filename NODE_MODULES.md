# Shrink Node Modules Guide

The first time I bundled the files from Forkify with Parcel, I
ended up with a node_modules folder which had a total size of 200-300MB. I thought that this was too much for a simple website. So, I decided to shrink the size of the node_modules folder by installing the packages globally and linking them to the project.

## Installation

### Install Node Modules Globally

First, I installed the packages globally with the following command:

```
npm install -g parcel @parcel/transformer-sass
```

### Link Modules

After that, I changed my current working folder to the path where the Forkify website files are being stored. There must be a ```package.json``` file. 

Then, I linked the packages to the project with the following command:

```
npm link parcel @parcel/transformer-sass
```

### Run

Now, you can start the server with ```npm start``` and check the new size of your ```node_modules``` folder