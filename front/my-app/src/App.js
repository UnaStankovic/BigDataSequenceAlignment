import React from 'react';
import logo from './logo.svg';
import './App.css';
import axios from "axios";

class App extends React.Component {

  constructor(props) {
    super(props);
    this.seqInput = React.createRef();
    this.state = {
      message: "",
      result: null,
    }
  }

  getResults(jobId){
      axios.get(`http://localhost:8080/query/${jobId}`)
      .then((response)=>{
        console.log(response);

        if (response.data.message == 'Pending...') {
          console.log(response.data);
          this.timer = setTimeout(this.getResults(jobId), 5000);
        } else {
          console.log(response.data);
          this.setState({
            result: response.data.data,
          });
        }
      })
      .catch((err)=>{
        this.setState({message: err});
      })
  }
  sendQuery(){
    const sequence = this.seqInput.current.value;
    //{"message":"success","data":{"jobId":"1298de8f-423a-4188-871c-86ff6f7abc16"},"status":202}
    axios({
      method: 'post',
      url: 'http://localhost:8080/query',
      data: {querySequence: sequence},
      })
      .then((response)=>{
          //handle success
          //console.log(response.data.data.jobId);
          console.log(response);
          const resData = response.data;
          console.log(resData);
          if("data" in resData){
            const jobId = resData.data.jobId;
            this.setState({message:"Please wait until " + jobId + " is finished."}); 
            this.timer = setTimeout(this.getResults(jobId), 5000);
          }else{
            this.setState({message:resData.message});
          }
          
          //setInterval 10 sec 
          //get rrsponse ruta 
          //response not pending - ubija interval 
          //set
      })
      .catch(function (response) {
          //handle error
          console.log(response);
      });
  }

  render(){
    return (
      <div className="page-wrapper">
        <header className="page-header">
          <h1>Big Data Sequence Aligner</h1>
          <p>This project is a concept demo of Big data sequence alignment tool</p>
        </header>
        <section className='content-wrapper'>
          <div className='main-content'>
            <h3>Insert a sequence to be aligned with:</h3>
            <textarea ref={this.seqInput} type='text' placeholder='Sequence goes here' rows="10" cols="30" />
            <button className='btn-wrap' onClick={this.sendQuery.bind(this)}>Send</button>
          </div>
          <div className='response-wrap'>
            <h4>{this.state.message}</h4>
          </div>
        </section>
      </div>
    );
  }
}

export default App;
