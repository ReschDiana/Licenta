import React, { useState, useEffect } from 'react'
import Spinner from '@atlaskit/spinner'
import DatePicker from 'react-datepicker';
import { create } from 'apisauce'
import { arc } from "d3-shape"
import { scaleLinear } from "d3-scale"
import '../assets/main.css'
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment'

const mobileBackendURL = 'http://10.0.2.2:8008';
const webBackendURL = 'http://localhost:8008';

const api = create({
    baseURL: mobileBackendURL
})

export default () => {

    // section state
    const [statsDate, setStatsDate] = useState(new Date())
    const [stats, setStats] = useState(null)
    const [overallIncidence, setOverallIncidence] = useState(null)
    const [infAngle, setInfAngle] = useState(0)
    const [curAngle, setCurAngle] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    // method that formats numbers from EN US into Romanian commas and dots (i.e. 5 tousand people should be 5.000 and not 5,000)
    const formatNumber = (x) => {
        return x.toString().replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // call to the backend to retrieve data to be displayed
    const fetchData = async (option) => {
        setIsLoading(true)
        let apiOption = 'currentDay'
        let apiDate = null
        if (option !== 'currentDay' && moment(new Date(option)).format("YYYY-MM-DD") !== moment(new Date()).format("YYYY-MM-DD")) {
            apiOption = 'perDay'
            apiDate = moment(new Date(option)).format("YYYY-MM-DD")
        }
        const { ok, data } = await api.post('/data/${apiOption}', { date: apiDate })
        if (ok) {
            setStats(data)
        }
        setIsLoading(false)
    }

    // decide the gillColor of the county based on incidence

    const angleScale = scaleLinear()
        .domain([0, 1])
        .range([0, 2 * Math.PI])
        .clamp(true)

    // dynamically update state when fetched data changes
    useEffect(() => {
        if (stats) {
            const { numberInfected, numberCured, numberDeceased } = stats
            const total = numberInfected + numberCured + numberDeceased
            setCurAngle(angleScale(numberCured / total))
            setInfAngle(angleScale(numberInfected / total))
            if (stats.incidence) {
                // calculate overall incidence
                let sumOfIncidence = 0

                for (let i = 0; i < Object.keys(stats.incidence).length; i++) {
                    sumOfIncidence += stats.incidence[Object.keys(stats.incidence)[i]]
                }
                setOverallIncidence(sumOfIncidence / 42)
            } else {
                setOverallIncidence(null)
            }

        } else {
            fetchData('currentDay')
        }
    }, [stats])

    // dynamically request fetching data when the DATE is changed
    useEffect(() => {
        fetchData(statsDate)
    }, [statsDate])

    // APP User Interface
    return (
        <div className='app-main'>
            <div>
                {
                    // handle loading data
                    isLoading &&
                    <div
                        style={{ position: "fixed", backgroundColor: 'rgba(0,0,0,0.4)', padding: 30, top: 0, left: 0, bottom: 0, right: 0, color: '#ddd', zIndex: 1 }}
                        className="d-flex justify-content-center align-items-center"
                    >
                        <Spinner />
                        {
                            <h3 className="ml-3">loading data - please wait ...</h3>
                        }
                    </div>
                }

                <div className='date-row'>
                    Report date &nbsp;
                <DatePicker
                        selected={statsDate}
                        onChange={(d) => setStatsDate(d)}
                        maxDate={new Date()}
                        minDate={new Date('2020-03-17')}
                    />
                </div>
                {
                    stats &&
                    <div className='stats-main'>
                        <div className='app-chart'>
                            <div clasName='chart-svg'>
                                <svg viewBox="0 0 200 200" width="10rem" style={{ overflow: "visible" }}>
                                    <path
                                        d={arc()
                                            .innerRadius(70)
                                            .outerRadius(100)
                                            .startAngle(0)
                                            .endAngle(infAngle)
                                            .padAngle(1 * Math.PI / 180)
                                            ()
                                        }
                                        fill='red'
                                        transform="translate(100,100)"
                                        width="100"
                                        height="100"
                                    />
                                    <path
                                        d={arc()
                                            .innerRadius(70)
                                            .outerRadius(100)
                                            .startAngle(curAngle + infAngle)
                                            .endAngle(2 * Math.PI)
                                            .padAngle(1 * Math.PI / 180)
                                            ()
                                        }
                                        fill='black'
                                        transform="translate(100,100)"
                                        width="100"
                                        height="100"
                                    />
                                    <path
                                        d={arc()
                                            .innerRadius(70)
                                            .outerRadius(100)
                                            .startAngle(infAngle)
                                            .endAngle(curAngle + infAngle)
                                            .padAngle(1 * Math.PI / 180)
                                            ()
                                        }
                                        fill='green'
                                        width="100"
                                        height="100"
                                        transform="translate(100,100)"
                                    />
                                </svg>
                            </div>
                            <div className='legend'>
                                <div className='legend-row'>
                                    <div className='legend-name'>Infected</div>
                                    <div className='legend-value'>{formatNumber(stats.numberInfected)}</div>
                                </div>
                                <div className='legend-row' style={{ color: 'green' }}>
                                    <div className='legend-name'>
                                        Cured </div>
                                    <div className='legend-value'>{formatNumber(stats.numberCured)}</div>
                                </div>
                                <div className='legend-row' style={{ color: 'red' }}>
                                    <div className='legend-name'>
                                        Deceased </div>
                                    <div className='legend-value'>{formatNumber(stats.numberDeceased)}</div>
                                </div>
                            </div>
                        </div>
                        <div className='stats-overall'>
                            <div className='stats-row'>
                                <div className='stats-row-name'>Incidenta cumulata</div>
                                {
                                    overallIncidence
                                        ? <div className='stats-row-value'>{formatNumber(parseFloat(overallIncidence).toFixed(2))}</div>
                                        : <div className='stats-row-value'>Data not available</div>
                                }

                            </div>
                            <div className='stats-row'>
                                <div className='stats-row-name'>Cazuri active</div>
                                <div className='stats-row-value'>{formatNumber(stats.numberInfected - stats.numberDeceased - stats.numberCured)}</div>
                                <div className='stats-row-percentage'>({formatNumber(parseFloat((stats.numberInfected - stats.numberDeceased - stats.numberCured) / stats.numberInfected * 100).toFixed(2))}%)</div>
                            </div>
                            <div className='stats-row'>
                                <div className='stats-row-name'>Vindecati</div>
                                <div className='stats-row-value'>{formatNumber(stats.numberCured)}</div>
                                <div className='stats-row-percentage'>({formatNumber(parseFloat(stats.numberCured / stats.numberInfected * 100).toFixed(2))}%)</div>
                            </div>
                            <div className='stats-row'>
                                <div className='stats-row-name'>Decedati</div>
                                <div className='stats-row-value'>{formatNumber(stats.numberDeceased)}</div>
                                <div className='stats-row-percentage'>({formatNumber(parseFloat(stats.numberDeceased / stats.numberInfected * 100).toFixed(2))}%)</div>
                            </div>
                            <div className='stats-row'>
                                <div className='stats-row-name'>Cazuri totale</div>
                                <div className='stats-row-value'>{formatNumber(stats.numberInfected)}</div>
                            </div>
                            <div className='stats-row'>
                                <div className='stats-row-name'>Doze de vaccin administrate</div>
                                <div className='stats-row-value'>{formatNumber(stats.numberTotalDosesAdministered)}</div>
                            </div>
                        </div>

                    </div>
                }
            </div>
            <div style={{ width: '411px', height: '290px' }}>
                <iframe scrolling="no" src="https://datelazi.ro/embed/confirmed_cases" width="411" height="290"></iframe>
            </div>
            <div style={{ width: '411px', height: '290px' }}>
                <iframe scrolling="no" src="https://datelazi.ro/embed/cured_cases" width="411" height="290"></iframe>
            </div>
            <div style={{ width: '411px', height: '290px' }}>
                <iframe scrolling="no" src="https://datelazi.ro/embed/dead_cases" width="411" height="290"></iframe>
            </div>
            <div style={{ width: '411px', height: '290px' }}>
                <iframe scrolling="no" src="https://datelazi.ro/embed/total_vaccine" width="411" height="290"></iframe>
            </div>
            <div style={{ width: '411px', height: '290px' }}>
                <iframe scrolling="no" src="https://datelazi.ro/embed/vaccine_immunization" width="411" height="290"></iframe>
            </div>
            <div style={{ width: '411px', height: '650px' }}>
                <iframe scrolling="no" src="https://datelazi.ro/embed/cazuri-pe-zi" width="411" height="650"></iframe>
            </div>
            <div style={{ width: '411px', height: '350px' }}>
                <iframe scrolling="no" src="https://datelazi.ro/embed/varsta" width="411" height="350"></iframe>
            </div>
        </div >
    )
}