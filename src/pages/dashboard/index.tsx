import { useEffect, useState, useContext } from "react";
import "./dashboard.css";
import { Container } from "../../components/container";
import { PainelDashboard } from "../../components/painel";

import { AuthContext } from "../../contexts/AuthContext";

import { FiTrash2 } from "react-icons/fi";

import { db, storage } from "../../services/firebaseConnection";
import { ref, deleteObject } from "firebase/storage";
import { collection, query, getDocs, where, doc, deleteDoc } from "firebase/firestore";
import Loader from "../../components/loader";

interface CarProps {
  id: string;
  name: string;
  year: string;
  uid: string;
  price: string | number;
  city: string;
  km: string;
  images: ImageCarProps[];
}

interface ImageCarProps {
  name: string;
  uid: string;
  url: string;
}

export function DashBoard() {
  const [cars, setCars] = useState<CarProps[]>([]);
  const [loadImages, setLoadImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    function loadCars() {
      if (!user?.uid) {
        return;
      }

      const carsRef = collection(db, "cars");
      const queryRef = query(carsRef, where("uid", "==", user.uid));

      getDocs(queryRef)
        .then((snapshot) => {
          let listCars = [] as CarProps[];
          snapshot.forEach((doc) => {
            listCars.push({
              id: doc.id,
              name: doc.data().name,
              year: doc.data().year,
              uid: doc.data().uid,
              km: doc.data().km,
              price: doc.data().price,
              city: doc.data().city,
              images: doc.data().images,
            });
          });
          setLoading(false);
          setCars(listCars);
        })
        .catch((error) => {
          console.error(error);
          console.log("[ERRO]");
          setLoading(false);
        });
    }

    loadCars();
  }, [user]);

  async function handleDeleteCar(item: CarProps) {
    const itemCar = item;

    const docRef = doc(db, 'cars', itemCar.id);
    await deleteDoc(docRef);
    
    itemCar.images.map( async (image) => {
        const imagePath = `images/${image.uid}/${image.name}`
        const imageRef = ref(storage, imagePath)
        try {
            await deleteObject(imageRef);
            setCars(cars.filter(car => car.id !== itemCar.id));
        } catch (error) {
            console.error(error);
            console.log('[ERRO] ERRO AO EXCLUIR A IMAGEM')
        }
    })
  }

  function handleImageLoad(id: string) {
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id]);
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <Container>
      <PainelDashboard />

      <h2 className="dashboard-h2">Carros adicionados do seu perfil</h2>

      <main className="dashboard-main">

        {cars.map((item) => (

            <section className="dashboard-car" key={item.name}>

              <button onClick={() => handleDeleteCar(item)} className="dashboard-car-trash-icon">
                <FiTrash2 size={25} color="#000" />
              </button>

              <div 
                className='home-car-img-load' id="dashboard-car-img-load"
                style={{display: loadImages.includes(item.id) ? 'none' : 'block'}}
                ></div>

              <img
                src={item.images[0].url}
                alt={item.name}
                onLoad={() => handleImageLoad(item.id)}
                className="dashboard-car-image"
              />

              <p>{item.name}</p>

              <div className="dashboard-car-span">
                <span>Ano {item.year} | {item.km} km</span>
                <strong>R$ {item.price}</strong>
              </div>

              <div className="dashboard-car-bar"></div>

              <div className="dashboard-car-city">
                <span>{item.city}</span>
              </div>

            </section>
        ))}
      </main>
    </Container>
  );
}
