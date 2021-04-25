# Rubik's Cube Web
This project aim to create a useful web version of Rubik's cube using the three js library. 

The demo page can be found [Here](https://shubymao.github.io/rubiks-cube-web).

The library accept various control method which includes touch, keyboard, and mouse. 

The animation is fluid and the relatively lightweight. The size of the cube (number of row and col) can be arbitrary but you will receive significant slow down when you reach size greater than 8x8 due to the limitation of the javascript performance.

Here are some images of the result.

Example of a 1x1 Cube

<img src="https://github.com/shubymao/rubiks-cube-web/blob/master/public/1x1.png?raw=true" width="300" />

Example of a 2x2 Cube

<img src="https://github.com/shubymao/rubiks-cube-web/blob/master/public/2x2.png?raw=true" width="300" />

Example of a 3x3 Cube

<img src="https://github.com/shubymao/rubiks-cube-web/blob/master/public/3x3.png?raw=true" width="300" />

Example of a 4x4 Cube

<img src="https://github.com/shubymao/rubiks-cube-web/blob/master/public/4x4.png?raw=true" width="300" />

Example of a 5x5 Cube

<img src="https://github.com/shubymao/rubiks-cube-web/blob/master/public/5x5.png?raw=true" width="300" />

Example of a shuffled Cube

<img src="https://github.com/shubymao/rubiks-cube-web/blob/master/public/shuffled.png?raw=true" width="300" />


## Using the Project
To use this library, simply clone the project and copy the lib folder along with the ThreeWrapper component into your own project and create a new game object and feeding it into the wrapper component.