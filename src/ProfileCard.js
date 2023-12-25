import React, { useState } from 'react'
import './ProfileCard.css'
import withAuth from './withAuth';

function ProfileCard() {
  
        const [name, setName] = useState('Alper Utku Eser');
        const [about, setAbout] = useState("Hey!, I am using ChitChat because WhatsUp is terrible xD. Just text me in ChitChat and let's start chatting!");  
  
    return (
    <div className='Card'>
        <div className='upper-container'>
            <div className='image-container'>
                <img src='' alt='' height="100px" width="100px" ></img>
            </div>
        </div>
        <div className='lower-container'>
            <h3> { name } </h3>
            <p> { about } </p>
        </div>
    </div>
  )
}

export default withAuth(ProfileCard);