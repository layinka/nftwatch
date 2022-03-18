import React, {useEffect, useState} from 'react'
import {  useParams, useHistory } from "react-router-dom";
import SelectDropdown from '../../comps/selectDropdown'
import Loader from '../../assets/covalent-logo-loop_dark_v2.gif'
import Alert from '../../assets/alert.svg'
import Back from '../../assets/Back.svg'
import Table from '../../comps/table'
import axios from 'axios'
import './style.css'
import { CONFIG } from '../../config'
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2'
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(...registerables);

const getDateOfDaysAgo = (daysAgo)=>{
  let today = new Date();
  today.setDate(today.getDate()-daysAgo)
  
 return today;// .toISOString().split('T')[0] 
}

const formatDate = (date) => {

  const months = ['Jan', 'Feb','Mar','Apr','May','Jun', 'Jul','Aug','Sep',,'Oct','Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export default function CollectionView() {
  let { address, id } = useParams();
  const [nft, setNft] = useState([])
  const [activeLoader, setLoader] = useState(true)
  const history = useHistory();
  const API_KEY = process.env['REACT_APP_COVALENT_API']

  useEffect(()=>{
    handleCollection()
    handleNft()
  },[])

  const [data, setData] = useState({})

  const [volumeChartData, setVolumeChartData] = useState()
  const [tokensSoldChartData, setTokensSoldChartData] = useState()

   var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });


  // Request for collection data
  const handleCollection = async() => {
	  
	  const today = new Date().toISOString().split('T')[0];
    
    let sevenDays = new Date();
    sevenDays.setDate(sevenDays.getDate()-7)
	  
	 const sevenDaysAgo = sevenDays.toISOString().split('T')[0] 
	  
    const resp = await axios.get(`https://api.covalenthq.com/v1/${id}/nft_market/collection/${address}/?quote-currency=USD&format=JSON&from=${sevenDaysAgo}&to=${today}&key=${API_KEY}`)

    console.log('Items:',resp.data.data.items); //volume_quote_day
    setData(resp.data.data.items[0])

    const lineData = {
      labels,
      datasets: [
        {
          label: 'Volume',
          data: resp.data.data.items.map(n=>n.volume_quote_day),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }
      ],
    };

    setVolumeChartData(lineData)
    setTokensSoldChartData({
      labels,
      datasets: [
        {
          label: 'Tokens Sold',
          data: resp.data.data.items.map(n=>n.unique_token_ids_sold_count_day),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }
      ],
    })
    
  }

  
  let days = [6,5,4,3,2,1,0].map((n)=>formatDate(getDateOfDaysAgo(n)) )
  const labels = days;// ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

  // Request for nft collection (first 5)
  const handleNft = async() => {
    
    const resp = await axios.get(`https://api.covalenthq.com/v1/${id}/tokens/${address}/nft_token_ids/?quote-currency=USD&format=JSON&page-size=5&key=${API_KEY}`)
    let collection = []

    // Request for nft metadata for display pictures
    for(let i of resp.data.data.items){
       let resp2 = await axios.get(`https://api.covalenthq.com/v1/${id}/tokens/${address}/nft_metadata/${i.token_id}/?quote-currency=USD&format=JSON&key=${API_KEY}`)
       collection.push(resp2.data.data.items[0].nft_data[0])
    }

    setNft([...collection])
    setLoader(false)

  }

  const volChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' ,
      },
      title: {
        display: true,
        text: 'Volume Chart',
      },
    },
  };
  const tokSalesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' ,
      },
      title: {
        display: true,
        text: 'Token Sold',
      },
    },
  };
  
  
  return (
    <>
        <>
        <div className="banner">
        </div>
        <div className="main">
          <div className="back" onClick={()=>{history.goBack()}}>
            <img alt="" src={Back}></img>
          </div>
          <div className="content">

          

            

            <div className="info">
              <div className="image">
                {activeLoader ? 
                <img alt="img" src={Loader}></img>
                :
                  <img alt="img" className="collection-img" onError={(event) => {
                  event.target.classList.add("error-image")
                  event.target.classList.remove("collection-img")
                  }} src={nft[0]?.external_data?.image}></img>
                }
              </div>
              <div className="details">
                <h2>Collection Address</h2>
                <h3>{address}</h3>
                <table className="collection-table">
                  <thead>
                    <tr className="title-row">
                      <td>Ticker Symbol</td>
                      <td>24hr Volume</td>
                      <td>24hr Sold Count</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className ="data-row">
                      <td>{data.collection_ticker_symbol ? data.collection_ticker_symbol : "null"}</td>
                      <td> {data.volume_quote_day ? formatter.format(data.volume_quote_day).split('.')[0]  : "null"}</td>
                      <td>{data.unique_token_ids_sold_count_day ? data.unique_token_ids_sold_count_day : "null"}</td>
                    </tr>
                  </tbody>
                  
                </table>
              </div>
            </div>
            <div className="charts" >
                <div className='floatLeft'>
                  {volumeChartData ? 
                    <Line className="chart"
                      options={volChartOptions}
                      width={400}
                      height={300}
                      data={volumeChartData}
                    /> : <span></span>
                  }
                </div>
                <div className='floatLeft'>
                  {tokensSoldChartData ? 
                  <Bar className="chart"
                    width={400}
                    height={300}
                    options={tokSalesChartOptions}
                    data={tokensSoldChartData}
                  /> : <span></span>
                  }
                </div>
                <br className='clearFix'/>
            </div>
            

            
          </div>
          <div className="bottom-section">
            <h3>NFT Preview</h3>
            {activeLoader ? 
            <div className="collection-load">
              <img alt="" src={Loader}></img>
            </div>
            :
            <div className="collection-display">
              {nft && nft.map((o,i)=>{
                return (
                    <div key={i} className="nft">
                      <img alt="nft" onError={(event) => {
                        event.target.classList.add("error-image")
                        event.target.classList.remove("collection-img")
                        }} className="collection-img" key={i} src={o ?.external_data?.image} onClick={()=>{history.push(`/nft/${address}/${o.token_id}`)}}>
                      </img>
                  </div>
                )
              })}
            </div>
            }
          </div>
          </div>
          </>
    </>
  );

}