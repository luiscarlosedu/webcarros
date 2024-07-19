import { useEffect, useState } from 'react';
import './car.css';
import { Container } from '../../components/container';

import { FaWhatsapp } from 'react-icons/fa';

import { useNavigate, useParams } from 'react-router-dom';

import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebaseConnection';

import { Swiper, SwiperSlide } from 'swiper/react';

interface CarDetailProps {
    id: string;
    name: string;
    model: string;
    whatsapp: string;
    city: string;
    year: string;
    km: string;
    price: string | number; 
    description: string;
    created: string;
    owner: string;
    uid: string;
    images: ImagesCarsProps[];
}

interface ImagesCarsProps {
    name: string;
    uid: string;
    url: string;
}

export function CarDetail() {
    const {id} = useParams();

    const [car, setCar] = useState({} as CarDetailProps);
    const [slider, setSlider] = useState<number>(2);

    const navigate = useNavigate();

    useEffect(() => {
        async function LoadCar() {
            
            if(!id) { return }

            const docRef = doc(db, 'cars', id);
            getDoc(docRef)
            .then((snapshot) => {

                if(!snapshot.data()) {
                    navigate('/', {replace: true});
                }

                setCar({
                    id: snapshot.id,
                    name: snapshot.data()?.name,
                    model: snapshot.data()?.model,
                    whatsapp: snapshot.data()?.whatsapp,
                    city: snapshot.data()?.city,
                    year: snapshot.data()?.year,
                    km: snapshot.data()?.km,
                    price: snapshot.data()?.price,
                    description: snapshot.data()?.description,
                    created: snapshot.data()?.created,
                    owner: snapshot.data()?.onwer,
                    uid: snapshot.data()?.uid,
                    images: snapshot.data()?.images
                })

            })
            .catch((error) => {
                console.error(error);
                console.log(error);
            })
        }

        LoadCar();
    }, [id]);

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth < 970) {
                setSlider(1);
            } else {
                setSlider(2);
            }
        }

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, []);


    return (
        <Container>

            {car && car?.images && (
                <Swiper
                slidesPerView={slider}
                pagination={{clickable: true}}
                navigation
                >
                    {car?.images.map(image => (
                        <SwiperSlide key={image.name}>
                            <img src={image.url} alt="" className='car-swiper-slide' />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}

            {car && (
                <main className='car-main'>
                    <div className="car-name-price">
                        <h2 className='car-name'>{car?.name}</h2>
                        <h2 className='car-price'>R$ {car?.price}</h2>
                    </div>

                    <p>{car?.model}</p>

                    <div className="car-city-year">
                        <div className='car-city-year-inside-container'>
                            <div>
                                <p>Cidade</p>
                                <strong>
                                    {car?.city}
                                </strong>
                            </div>
                            <div>
                                <p>Ano</p>
                                <strong>
                                    {car?.year}
                                </strong>
                            </div>
                        </div>

                        <div className='car-city-year-inside-container'>
                            <div>
                                <p>KM</p>
                                <strong>
                                    {car?.km}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <strong>Descrição</strong>
                    <p className='car-description'>{car?.description}</p>

                    <strong>Telefone / WhatsApp</strong>
                    <p>{car?.whatsapp}</p>

                    <a href={`https://api.whatsapp.com/send/?phone=55${car?.whatsapp}&text=Olá! Vi esse ${car?.name} e fiquei interessado!&type=phone_number&app_absent=0`} target='_blank' className='car-whatsapp'>
                        Conversar com o vendedor
                        <FaWhatsapp size={26} color='#fff' />
                    </a>
                </main>
            )}
        </Container>
    )
}