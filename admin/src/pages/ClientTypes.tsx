import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import Layout from '@/components/Layout'
import { strings } from '@/lang/client-types'
import ClientTypeList from '@/components/ClientTypeList'

import '@/assets/css/users.css' // Reuse users css for now or create generic list css

const ClientTypes = () => {
    const navigate = useNavigate()

    return (
        <Layout strict>
            <div className="users">
                <div className="col-1">
                    <div className="div.col-1-container">
                        <Button variant="contained" className="btn-primary new-user" size="small" onClick={() => navigate('/create-client-type')}>
                            {strings.NEW_CLIENT_TYPE}
                        </Button>
                    </div>
                </div>
                <div className="col-2">
                    <ClientTypeList
                        checkboxSelection={true}
                    />
                </div>
            </div>
        </Layout>
    )
}

export default ClientTypes
