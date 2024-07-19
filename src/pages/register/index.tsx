import { useEffect, useContext } from 'react';
import './register.css';
import logo from '../../assets/webcarros.png';

import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { Container } from '../../components/container';
import { Input } from '../../components/input';

import {useForm} from 'react-hook-form';
import {z} from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import {auth} from '../../services/firebaseConnection';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { AuthContext } from '../../contexts/AuthContext';

import toast from 'react-hot-toast';

const schema = z.object({
    nome: z.string().min(1, 'O nome é obrigatório!'),
    email: z.string().email('Insira um email válido!').min(1, 'O email é obrigatório!'),
    password: z.string().min(6, 'A senha deve ter pelo ao menos 6 digitos!')
})

type FormData = z.infer<typeof schema>

export function Register() {
    const {handleInfoUser} = useContext(AuthContext);
    const navigate = useNavigate();
    const {register, handleSubmit, formState: {errors}} = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: 'onChange'
    })

    async function onSubmit(data: FormData) {
        createUserWithEmailAndPassword(auth, data.email, data.password)
        .then(async (user) => {
            await updateProfile(user.user, {
                displayName: data.nome, 
            })

            handleInfoUser({
                name: data.nome,
                email: data.email,
                uid: user.user.uid
            })

            console.log('Cadastrado com sucesso!');
            navigate('/dashboard', {replace: true}) // envolvendo negocio de histórico
            toast.success('Bem vindo ao WebCarros!')
        })
        .catch((error) => {
            console.log('[ERRO] Não foi possível concluir o cadastro do usuário!')
            console.error(error)
            alert('[ERRO] Esse já está sendo utilizado!')
        })
    }

    useEffect(() => {
        async function handleLogout() {
            await signOut(auth)
        }

        handleLogout();
    }, []);

    return (
        <Container>
            <main className='login-main'>
                <Link to='/'>
                    <img
                     className='login-main-img'
                     src={logo}
                     alt="Logo WebCarros" />
                </Link>

                <form
                onSubmit={handleSubmit(onSubmit)}
                >

                    <div className='login-form-input'>
                        <Input 
                        type='text'
                        placeholder='Digite seu nome'
                        name='nome'
                        error={errors.nome?.message}
                        register={register}
                        />
                    </div>

                    <div className='login-form-input'>
                        <Input 
                        type='Email'
                        placeholder='Digite seu email'
                        name='email'
                        error={errors.email?.message}
                        register={register}
                        />
                    </div>

                    <div className='login-form-input'>
                        <Input 
                        type='password'
                        placeholder='Digite sua senha'
                        name='password'
                        error={errors.password?.message}
                        register={register}
                        />
                    </div>

                    <button
                    type='submit'
                    >
                        Cadastrar
                    </button>
                </form>

                <Link to='/login' className='register-to-login'>
                    Já possui uma conta? <span>Faça o login!</span>
                </Link>

            </main>
        </Container>
    )
}