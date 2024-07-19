import './painel.css';

import { Link } from 'react-router-dom';

import { signOut } from 'firebase/auth';
import {auth} from '../../services/firebaseConnection'

export function PainelDashboard() {

    async function handleLogOut() {
        await signOut(auth);
    }

    return (
        <div className='painel-dashboard'> 
            <Link to='/dashboard'>
                Dashboard
            </Link>
            <Link to='/dashboard/new'>
                Cadastrar carro
            </Link>

            <button
            onClick={handleLogOut}
            >
                Sair da conta
            </button>
        </div>
    )
}