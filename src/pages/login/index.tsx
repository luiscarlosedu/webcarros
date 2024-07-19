import { useEffect } from 'react';
import './login.css';
import logo from '../../assets/webcarros.png';

import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { Container } from '../../components/container';
import { Input } from '../../components/input';

import {useForm} from 'react-hook-form';
import {z} from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import {auth} from '../../services/firebaseConnection';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

import toast from 'react-hot-toast';

const schema = z.object({
    email: z.string().email('Insira um email válido'),
    password: z.string().min(1, 'A senha é obrigatória!')
})

type FormData = z.infer<typeof schema>

export function Login() {
    const navigate = useNavigate();
    const {register, handleSubmit, formState: {errors}} = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: 'onChange'
    })

    function onSubmit(data: FormData) {
        signInWithEmailAndPassword(auth, data.email, data.password)
        .then( () => {
            console.log('LOGADO COM SUCESSO!');
            navigate('/dashboard', {replace: true});
            toast.success('Logado com sucesso!');
        })
        .catch((error) => {
            console.error(error);
            console.log('[ERRO] Não foi possível fazer o login do usuário!')
            toast.error('[ERRO] Esse usuário não existe!')
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
                        Acessar
                    </button>
                </form>

                <Link to='/register' className='register-to-login'>
                    Ainda não possui uma conta? <span>Cadastre-se</span>
                </Link>

            </main>
        </Container>
    )
}