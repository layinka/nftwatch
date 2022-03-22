import React, {useEffect, useState} from 'react'
import SelectDropdown from '../../comps/selectDropdown'
import Table from '../../comps/table'
import { useHistory } from "react-router-dom";
import { CONFIG } from '../../config'
import Loader from '../../assets/covalent-logo-loop_dark_v2.gif'
import axios from 'axios';
import './style.css'


export default function LandingPage() {

    var formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      });

    const history = useHistory();
    const [chain, setChain] = useState(1)
    const [market, setMarket] = useState([])
    const [totalChainMarketCap, setTotalChainMarketCap] = useState(0)
    const [totalChain24hVol, setTotalChain24hVol] = useState(0)
    const [activeLoader, setLoader] = useState(true)
    const API_KEY = process.env['REACT_APP_COVALENT_API']

  
    useEffect(()=>{
      handleMarket(chain)
    },[chain])

    // Request for market (global view)
    const handleMarket = async(chainId) => {
      const resp = await axios.get(`https://api.covalenthq.com/v1/${chainId}/nft_market/?&key=${API_KEY}`)
      setMarket(resp.data.data.items)

      setTotalChainMarketCap(resp.data.data.items.map(m=>m.market_cap_quote).reduce((p,q)=> p + q) ); 
      setTotalChain24hVol( resp.data.data.items.map(m=>m.volume_quote_24h).reduce((p,q)=> p + q) );
      setLoader(false)
    }

    return (
      <>
      <div className="banner">
      </div>
      <div className = "main">
        <div className="content">
          <div className="select-chain">
            <SelectDropdown
                options={CONFIG.FILTER_OPTIONS}
                onChange={(e)=>{setChain(e.target.value)}}
            />
          </div>
          {activeLoader ? 
          <div className="load">
            <img alt=""  src={Loader}></img>
          </div> 
          :
          <>
            
            <table className="total-table">
              <thead>
                <tr className="title-row">
                  <td>Total Market Cap</td>
                  <td>Total 24h Volume</td>
                  
                </tr>
              </thead>
              <tbody>
                <tr className ="data-row">
                  <td> {totalChainMarketCap ? formatter.format(totalChainMarketCap).split('.')[0] : "null"}</td>
                  <td> { totalChain24hVol ? formatter.format(totalChain24hVol).split('.')[0] : "null" }</td>
                  
                </tr>
              </tbody>
              
            </table>

            <Table
              onClick={(id) =>{ history.push(`/collection/${id}/${chain}`)}}
              data={market}
            />
          </>
          }
        </div>
      </div>
      </>
    )
  
}