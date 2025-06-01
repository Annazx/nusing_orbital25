import { useState } from 'react'

export function Header(props) {
    return (
        <header>
            <h1>Tutor's Dashboard</h1>
            <h3>You have 3 upcoming appointments.</h3>
        </header>
    )
}

export function Tabs(props) {
    const { appts } = props
    const tabs = ['All', 'Upcoming', 'Past']
    return (
        <nav className="tab-container">
            {tabs.map((tab, tabIndex) => {

                const numOfAppts = tab === 'All' ?
                    appts.length : 
                    tab === 'Upcoming' ?
                    appts.filter(val => !val.complete).length :
                    appts.filter(val => val.complete).length

                return (
                    <button key={tabIndex}
                    className="tab-button">
                        <h4>{tab}<span>({numOfAppts})
                            </span></h4>
                    </button>
                )
            }) }
        </nav>
    )
}

export function Card(props) {
    const {apptIndex, appts} = props
    const appt = appts[apptIndex]
    return (
        <div className="card appt-item">
            <p>Tutor {appt.name} in {appt.class} at {appt.time} on {appt.date}</p>
            <div className="todo-buttons">
                <button disabled={appt.complete}>
                    <h6>Reschedule</h6>
                </button>
                <button>
                    <h6>Cancel</h6>
                </button>
            </div>
        </div>
    )
}

export function List(props) {
    const { appts } = props
    
    const tab = 'Upcoming'
    const filterApptsList = tab === 'All' ?
        appts : tab === 'Past' ?
        appts.filter(val => val.complete) :
        appts.filter(val => !val.complete)

    return (
        <>
            {filterApptsList.map((appt, apptIndex)=>{
                return (
                    <Card key={apptIndex} apptIndex=
                    {apptIndex} {...props}/>
                )
            })}
        </>
    )
}

const Tutor = () => {
  const appts = [
    { name: "Harry Potter", class: "Divination", date: "1/29/19", time: "9:00 am", complete: true },
    { name: "Luna", class: "Divination", date: "7/12/23", time: "9:00 am", complete: false },
    { name: "Albus", class: "Defence Against the Dark Arts", date: "1/2/23", time: "10:00 am", complete: false },
    { name: "Snape", class: "Magical Creatures", date: "9/10/23", time: "12:00 am", complete: true },
  ]
  return (
    <>
      <Header appts={appts}/>
      <Tabs appts={appts}/>
      <List appts={appts}/>
    </>
  );
};

export default Tutor;