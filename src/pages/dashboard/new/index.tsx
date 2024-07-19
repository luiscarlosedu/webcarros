import { ChangeEvent, useState, useContext } from 'react';
import { FiUpload, FiTrash } from 'react-icons/fi';
import './new.css';

import { PainelDashboard } from '../../../components/painel';
import { Container } from '../../../components/container';
import { Input } from '../../../components/input';

import { AuthContext } from '../../../contexts/AuthContext';

import {useForm} from 'react-hook-form';
import {z} from 'zod';
import { zodResolver } from '@hookform/resolvers/zod'; 
import { v4 as uuidV4 } from 'uuid';

import { db, storage } from '../../../services/firebaseConnection';
import { ref, uploadBytes ,getDownloadURL, deleteObject } from 'firebase/storage';

import { addDoc, collection} from 'firebase/firestore'; 
import toast from 'react-hot-toast';

const schema = z.object({
    name: z.string().min(1, "O campo nome é obrigatório!"),
    model: z.string().min(1, "O modelo é obrigatório!"),
    year: z.string().min(1, "O ano do carro é obrigatório!"),
    km: z.string().min(1, "O KM do carro é obrigatório!"),
    price: z.string().min(1, "O preço do carro é obrigatório!"),
    city: z.string().min(1, "O campo cidade é obrigatória!"),
    whatsapp: z.string().min(10, "Número de telefone inválido!").max(12),
    description: z.string().min(1, "O descrição é obrigatória!"),
})

type FormData = z.infer<typeof schema>

interface ImageItemProps {
    uid: string;
    name: string;
    previewUrl: string;
    url: string;
}

export function New() {

    const {user} = useContext(AuthContext);

    const [carImages, setCarImages] = useState<ImageItemProps[]>([]);

    const {register, handleSubmit, formState: {errors}, reset} = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: 'onChange'
    });

    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if(e.target.files && e.target.files[0]) {
            const image = e.target.files[0];
            
            if (image.type === 'image/jpeg' || image.type === 'image/png') {
                // enviar pro banco de dados, criar uma função assicrona

                await handleUpload(image);

            } else {
                alert('Por favor, envie uma imagem jpeg ou png! :)');
                return
            }
        }
    }

    async function handleUpload(image: File) {

        if(!user?.uid) {
            return;
        }

        const currentUid = user?.uid;
        const imageUid = uuidV4();

        const uploadRef = ref(storage, `images/${currentUid}/${imageUid}`)

        uploadBytes(uploadRef, image)
        .then((snapshot) => {
            getDownloadURL(snapshot.ref)
            .then((downloadUrl) => {
                const imageItem = {
                    name: imageUid,
                    uid: currentUid,
                    previewUrl: URL.createObjectURL(image), 
                    url: downloadUrl,
                }

                setCarImages((images) => [...images, imageItem]); 
                toast.success('Imagem cadastrada!')
            })
            .catch((error) => {
                console.log(error);
            })
        })
        .catch((error) => {
            console.log(error);
        })
    }

    async function handleDeleteImage(item: ImageItemProps) {
        const imagePath = `images/${item.uid}/${item.name}`
        const imageRef = ref(storage, imagePath)
        try {
            await deleteObject(imageRef);
            setCarImages(carImages.filter(car => car.url !== item.url))
        } catch (error) {
            console.log(error);
        }
    }

    function onSubmit(data: FormData) {
        if(carImages.length === 0) {
            toast.error('Por favor, envie alguma imagem desse carro!');
            return;
        }

        const carListImages = carImages.map((car) => {
            return {
                uid: car.uid,
                name: car.name,
                url: car.url
            }
        })

        addDoc(collection(db, 'cars'), {
            name: data.name.toUpperCase(),
            model: data.model,
            whatsapp: data.whatsapp,
            city: data.city,
            year: data.year,
            km: data.km,
            price: data.price,
            description: data.description,
            created: new Date(),
            owner: user?.name,
            uid: user?.uid,
            images: carListImages
        })
        .then(() => {
            reset();
            setCarImages([]);
            console.log('Cadastrado com sucesso!');
            toast.success('Carro cadastrado com sucesso!')
        })
        .catch((error) => {
            console.error(error);
            console.log('[ERRO] ERRO AO CADASTRAR NO BANCO!!!')
            toast.error('[ERRO] ERRO AO CADASTRAR NO BANCO!!!')
        })
    }

    return (
        <Container>
            <PainelDashboard />

            <div className="new-file-field">
                <button className='new-file-button'>
                    <div className='new-file-button-icon'>
                        <FiUpload size={30} color='#000' />
                    </div>
                    <div className='new-file-button-input'>
                        <input type="file" accept='image/*' onChange={handleFile} />
                    </div>
                </button>

                {carImages.map((item) => (
                    <div key={item.name} className='new-file-car-image-container'>
                        <button className='new-file-car-image-icon' 
                        onClick={() => handleDeleteImage(item)}
                        >
                            <FiTrash size={28} color='#fff'/>
                        </button>

                        <img 
                        src={item.previewUrl}
                        alt={item.name}
                        className='new-file-car-image'
                        />
                    </div>
                ))}

            </div>

            <div className="new-form-container">
                
                <form className="new-form" onSubmit={handleSubmit(onSubmit)}>

                    <div className='new-form-label-input-container'>
                        <label htmlFor='name' className='new-form-label'><p>Nome do carro</p></label>
                        <Input 
                        type='text'
                        register={register}
                        name='name'
                        error={errors.name?.message}
                        placeholder='Ex: Onix 1.0...'
                        />
                    </div>

                    <div className='new-form-label-input-container'>
                        <label htmlFor='model' className='new-form-label'><p>Modelo</p></label>
                        <Input 
                        type='text'
                        register={register}
                        name='model'
                        error={errors.model?.message}
                        placeholder='Ex: 1.0 Flex Plus Manual...'
                        />
                    </div>

                    <div className="new-form-label-input-container-field">
                        
                        <div className='new-form-label-input-container double'>
                            <label htmlFor='year' className='new-form-label'><p>Ano</p></label>
                            <Input 
                            type='text'
                            register={register}
                            name='year'
                            error={errors.year?.message}
                            placeholder='Ex: 2016/2016...'
                            />
                        </div>

                        <div className='new-form-label-input-container double'>
                            <label htmlFor='km' className='new-form-label'><p>KM rodados</p></label>
                            <Input 
                            type='text'
                            register={register}
                            name='km'
                            error={errors.km?.message}
                            placeholder='Ex: 23.900...'
                            />
                        </div>

                    </div>

                    <div className="new-form-label-input-container-field">
                        
                        <div className='new-form-label-input-container double'>
                            <label htmlFor='whatsapp' className='new-form-label'><p>Telefone | Whatsapp</p></label>
                            <Input 
                            type='text'
                            register={register}
                            name='whatsapp'
                            error={errors.whatsapp?.message}
                            placeholder='Ex: 01199910192...'
                            />
                        </div>

                        <div className='new-form-label-input-container double'>
                            <label htmlFor='city' className='new-form-label'><p>Cidade</p></label>
                            <Input 
                            type='text'
                            register={register}
                            name='city'
                            error={errors.city?.message}
                            placeholder='Ex: Campo Grande - MS...'
                            />
                        </div>
                        
                    </div>

                    <div className='new-form-label-input-container'>
                        <label htmlFor='price' className='new-form-label'><p>Preço</p></label>
                        <Input 
                        type='text'
                        register={register}
                        name='price'
                        error={errors.price?.message}
                        placeholder='Ex: 69.000...'
                        />
                    </div>

                    <div className='new-form-label-input-container'>
                        <label htmlFor='price' className='new-form-label'><p>Descrição</p></label>
                        <textarea 
                        className='new-form-text-area'
                        {...register('description')}
                        name='description'
                        id='description'
                        placeholder='Digite a descrição completa do carro...'
                        />
                        {errors.description && <p className='new-form-text-area-error'>{errors.description.message}</p>}
                    </div>

                    <button
                    type='submit'
                    className='new-form-btn'
                    >
                        Cadastrar
                    </button>

                </form>
            </div>

        </Container>
    )
}