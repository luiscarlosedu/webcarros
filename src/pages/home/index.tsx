import { useEffect, useState } from 'react';
import './home.css';
import Loader from '../../components/loader';
import { Container } from '../../components/container'

import { Link } from 'react-router-dom';

import {
    collection,
    query,
    getDocs,
    orderBy,
    where
 } from 'firebase/firestore';

import { db } from '../../services/firebaseConnection';

interface CarsProps {
    id: string;
    name: string;
    year: string;
    uid: string;
    price: string | number;
    city: string;
    km: string;
    images: CarImageProps[];
}

interface CarImageProps {
    name: string;
    uid: string;
    url: string;
}

export function Home() {

    const [cars, setCars] = useState<CarsProps[]>([]);
    const [loadImages, setLoadImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState('');
    
    useEffect(() => {
        loadCars();

        window.addEventListener('load', loadCars)
    }, []);

    function loadCars() {
        const carsRef = collection(db, 'cars')
        const queryRef = query(carsRef, orderBy('created', 'desc'))

        getDocs(queryRef)
        .then((snapshot) => {
            let listCars = [] as CarsProps[];
            snapshot.forEach(doc => {
                listCars.push({
                    id: doc.id,
                    name: doc.data().name,
                    year: doc.data().year,
                    uid: doc.data().uid,
                    km: doc.data().km,
                    price: doc.data().price,
                    city: doc.data().city,
                    images: doc.data().images,
                })
            })
            setLoading(false);
            setCars(listCars);
        })
        .catch((error) => {
            console.error(error);
            console.log('[ERRO]')
            setLoading(false);
        })
    }

    function handleImageLoad(id: string) {
        setLoadImages((prevImageLoaded) => [...prevImageLoaded, id]);
    }

    async function handleSearchCar() {
        if (input === '') {
            loadCars();
            return
        } 

        setCars([]);
        setLoadImages([]);  

        const q = query(collection(db, 'cars'), 
        where('name', '>=', input.toUpperCase()),
        where('name', '<=', input.toUpperCase() + '\uf8ff')
        )

        const querySnapshot = await getDocs(q);
        let listCars = [] as CarsProps[];
        
        querySnapshot.forEach(doc => {
            listCars.push({
                id: doc.id,
                name: doc.data().name,
                year: doc.data().year,
                uid: doc.data().uid,
                km: doc.data().km,
                price: doc.data().price,
                city: doc.data().city,
                images: doc.data().images,
            })
        })

        setCars(listCars)
    }

    if (loading) {
        return (
            <Loader />
        )
    }

    return (
        <Container>
            <section className='home-section'>
                <input
                 type="text"
                 placeholder='Digite o nome do carro'
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                />

                <button
                 onClick={handleSearchCar}
                >
                    Buscar
                </button>
            </section>

            <h1 className='home-title'>Carros novos e usados em todo o Brasil!</h1>

            <main className='home-main'>
                {cars.map((item) => (
                    <Link to={`/car/${item.id}`} key={item.id} className='home-car-link-container'>
                        <section className="home-car">
                            <div 
                            className='home-car-img-load'
                            style={{display: loadImages.includes(item.id) ? 'none' : 'block'}}
                            ></div>
                            <img
                             src={item.images[0].url}
                             alt={item.name} 
                             onLoad={() => handleImageLoad(item.id)}
                             style={{display: loadImages.includes(item.id) ? 'block' : 'none'}}
                             />
                            <p>
                                {item.name}
                            </p>
                            <div className='home-car-content'>
                                <span>
                                    Ano {item.year} | {item.km} km
                                </span>
                                <strong>
                                    R$ {item.price}
                                </strong>
                            </div>
                            <div className="home-car-bar">
                            </div>
                            <div className="home-car-cidade">
                                <span>{item.city}</span>
                            </div>
                        </section>
                    </Link>
                )) }
                
            </main>

        </Container>
    )
}