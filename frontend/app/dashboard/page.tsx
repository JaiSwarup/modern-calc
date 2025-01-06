'use client'
import { useAuth, UserButton, useUser } from '@clerk/nextjs'
// import { WorkbookInstance } from '@fortune-sheet/react'
import {useRouter} from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaArrowLeft, FaPlus } from 'react-icons/fa'
import styles from './page.module.scss'
import axios from 'axios'
import Link from 'next/link'

export default function Dashboard() {
    const { userId } = useAuth()
    const { user } = useUser()
    const router = useRouter()
    const [myWorkbooks, setMyWorkbooks] = useState<any[]>([])
    const [username, setUsername] = useState('')
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
    const [allowedWorkbooks, setAllowedWorkbooks] = useState<any[]>([])
    // console.log(userId)
    // console.log(sessionId)
    // console.log(user);

    useEffect(() => {
        if (!userId) return
        axios.get('http://localhost:3001/api/workbooks', {
            params : {
                userId: userId
            }
        })
            .then((res) => {
                setMyWorkbooks(res.data)
                setLoading(false)
            })
            .catch((err) => {
                console.error(err)
                setError(true)
                setLoading(false)
            })
    }, [userId])

    useEffect(() => {
        if (!userId) return
        axios.get('http://localhost:3001/api/workbooks/shared',{
            params: {
                userId: userId
            }
        })
            .then((res) => {
                setAllowedWorkbooks(res.data)
                setLoading(false)
            })
            .catch((err) => {
                console.error(err)
                setError(true)
                setLoading(false)
            })
    }, [userId])

    useEffect(() => {
        if (!user?.firstName) return
        setUsername(user?.firstName)
    }, [user?.firstName])

    const handleCreateWorkbook = () => {
        console.log(userId)
        axios.get('http://localhost:3001/api/workbooks/create', {
            params: {
                userId: userId,
            }
        })
            .then((res) => {
                console.log(res.data)
                router.push(`/workbooks/${res.data.id}`)
            })
            .catch((err) => {
                console.error(err)
            }
        )
    }

    return (
      <div>
        <header className={styles.header}>
            <Link href="/">
            <FaArrowLeft />
            </Link>
            <UserButton />
        </header>
        <h1 className={styles.greeting}>Hi {username.length > 0 ? username : "There"}!</h1>
        <div className={styles.container}>

        <div className={styles.workbooks}>
        <h2 className={styles.subheading}>Your workbooks:</h2>
            {loading && <p>Loading...</p>}
            {error && <p className={styles.error}>There was an error loading your workbooks</p>}
            {(myWorkbooks.length == 0 && !error && !loading)?
                <p>You haven&apos;t created any workbooks yet</p>
                :
                myWorkbooks.map((workbook) => {
                    return (
                    <Link href={`/workbooks/${workbook.id}`} key={workbook.id} className={styles.workbook}>
                        <h3>{workbook.name}</h3>
                    </Link>
                    )
                })
        }
      </div>
        <div className={styles.workbooks}>
        <h2 className={styles.subheading}>Workbooks shared with you:</h2>
            {loading && <p>Loading...</p>}
            {error && <p className={styles.error}>There was an error loading your workbooks</p>}
            {(allowedWorkbooks.length == 0 && !error && !loading)
            ?
            <p>You don&apos;t have access to any workbooks yet</p>
            :
            allowedWorkbooks.map((workbook) => {
                return (
                    <Link href={`/workbooks/${workbook.id}`} key={workbook.id} className={styles.workbook}>
                        <h3>{workbook.name}</h3>
                    </Link>
                )
            })
            }

        </div>
        </div>
        <div className={styles.create}>
            <button onClick={handleCreateWorkbook}> <FaPlus/> Create Workbook</button>
        </div>
        </div>
    )
}