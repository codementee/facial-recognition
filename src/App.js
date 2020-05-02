import React, { Component } from 'react';
import Clarifai from 'clarifai';
import Logo from './components/Logos/Logo.js';
import SignOut from './components/SignOut/SignOut.js';
import Signin from './components/Signin/Signin.js';
import Register from './components/Register/Register.js';
import Header from './components/Header/Header.js';
import Rank from './components/Rank/Rank.js';
import InputLink from './components/InputLink/InputLink.js';
import Result from './components/Result/Result.js';
import './App.css';


const app = new Clarifai.App({
  apiKey: '90ee53e5901f478ba513e2ecf69ea73c'
 });

class App extends Component {
  constructor(){
    super();
    this.state = {
      input: '',
      imgUrl: '', 
      boxArray: [],
      route: 'signin',
      isSignedIn: false
    }
  }

  calculateFaceLocation = (data) => {
      const clarifaiFace = data.outputs[0].data.regions;
      let measureObj;
      let regionArray = [];
      const image = document.getElementById('inputImg');
      const width = Number(image.width);
      const height = Number(image.height);
      clarifaiFace.forEach(each => {
        const boundingBox = each.region_info.bounding_box;
        measureObj = {
          leftCol: boundingBox.left_col * width,
          topRow: boundingBox.top_row * height,
          rightCol: width - (boundingBox.right_col * width), 
          bottomRow: height - (boundingBox.bottom_row * height)
      }
      regionArray.push(measureObj);
    })
    return regionArray;
  }


  displayFace = (box) => {

    let joined = this.state.boxArray.concat(box);
    this.setState({ boxArray: joined })
  }

  onInputChange = (event)=> {
    this.setState({input: event.target.value});
  }

  onSubmit = () => {
    this.setState({imgUrl: this.state.input})
    app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
    .then((response) =>{
      console.log(response)
      const regionArrayData = this.calculateFaceLocation(response)
      for(let i = 0; i < regionArrayData.length; i++){
        this.displayFace(regionArrayData[i])
      }
    })
    .catch(err => console.log(err))
  }

  onRouteChange = (route) => {
    if(route === 'signout') {
      this.setState({isSignedIn: false})
    } else {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route})
  }

  render() {
    return (
      <div className="App">
        <Header>
            <Logo />
            <SignOut isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
        </Header>
        {this.state.route === 'home' 
        ?  <div>
            <Rank />
            <InputLink onInputChange={this.onInputChange} onSubmit={this.onSubmit}/>
            <Result boxArray={this.state.boxArray} imgUrl={this.state.imgUrl}/>
          </div>
          
        : ( 
          this.state.route === 'signin'
          ? <Signin onRouteChange={this.onRouteChange}/>
          : <Register onRouteChange={this.onRouteChange}/>
        )
        }
      </div>
    );
  }
}

export default App;

