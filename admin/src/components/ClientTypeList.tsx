import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridRowId,
} from '@mui/x-data-grid'
import {
    Tooltip,
    IconButton,
    Link,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material'
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material'
import * as bookcarsTypes from ':bookcars-types'
import env from '@/config/env.config'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/client-type-list'
import * as helper from '@/utils/helper'
import * as ClientTypeService from '@/services/ClientTypeService'

interface ClientTypeListProps {
    keyword?: string
    hideDesktopColumns?: boolean
    checkboxSelection?: boolean
}

const ClientTypeList = ({
    keyword: clientTypeListKeyword,
    hideDesktopColumns,
    checkboxSelection,
}: ClientTypeListProps) => {
    const navigate = useNavigate()

    const [columns, setColumns] = useState<GridColDef<bookcarsTypes.ClientType>[]>([])
    const [rows, setRows] = useState<bookcarsTypes.ClientType[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState('')
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [keyword, setKeyword] = useState(clientTypeListKeyword)
    const [reloadColumns, setReloadColumns] = useState(false)

    const fetchData = async () => {
        try {
            setLoading(true)
            const data = await ClientTypeService.getClientTypes(keyword || '')
            setRows(data)
        } catch (err) {
            helper.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setKeyword(clientTypeListKeyword || '')
    }, [clientTypeListKeyword])

    useEffect(() => {
        fetchData()
    }, [keyword]) // eslint-disable-line react-hooks/exhaustive-deps

    const getColumns = (): GridColDef<bookcarsTypes.ClientType>[] => {
        const _columns: GridColDef<bookcarsTypes.ClientType>[] = [
            {
                field: 'name',
                headerName: 'Name', // ToDo: Localize
                flex: 1,
                valueGetter: (value: string) => value,
            },
            {
                field: 'displayName',
                headerName: 'Display Name', // ToDo: Localize
                flex: 1,
                valueGetter: (value: string) => value,
            },
            {
                field: 'description',
                headerName: 'Description', // ToDo: Localize
                flex: 1,
                valueGetter: (value: string) => value,
            },
            {
                field: 'discount',
                headerName: 'Discount (%)', // ToDo: Localize
                flex: 1,
                valueGetter: (value: number, row: bookcarsTypes.ClientType) => {
                    return row.privileges?.rentDiscount || 0
                },
            },
            {
                field: 'active',
                headerName: 'Active', // ToDo: Localize
                flex: 1,
                renderCell: ({ value }: GridRenderCellParams<bookcarsTypes.ClientType, boolean>) => (
                    value ? <span className="bs bs-active">Active</span> : <span className="bs bs-inactive">Inactive</span>
                ),
                valueGetter: (value: boolean) => value,
            },
            {
                field: 'action',
                headerName: '',
                sortable: false,
                disableColumnMenu: true,
                renderCell: ({ row }: GridRenderCellParams<bookcarsTypes.ClientType>) => {
                    const handleDelete = (e: React.MouseEvent<HTMLElement>) => {
                        e.stopPropagation() // don't select this row after clicking
                        setSelectedId(row._id || '')
                        setOpenDeleteDialog(true)
                    }

                    return (
                        <div>
                            <Tooltip title={commonStrings.UPDATE}>
                                <IconButton onClick={() => navigate(`/update-client-type?id=${row._id}`)}>
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={commonStrings.DELETE}>
                                <IconButton onClick={handleDelete}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </div>
                    )
                },
                renderHeader: () => (selectedIds.length > 0 ? (
                    <div>
                        <div style={{ width: 40, display: 'inline-block' }} />
                        <Tooltip title={strings.DELETE_SELECTION}>
                            <IconButton
                                onClick={() => {
                                    setOpenDeleteDialog(true)
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                ) : (
                    <></>
                )),
            },
        ]

        if (hideDesktopColumns) {
            _columns.splice(1, 3)
        }

        return _columns
    }

    useEffect(() => {
        const _columns = getColumns()
        setColumns(_columns)
    }, [selectedIds, reloadColumns]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleCancelDelete = () => {
        setOpenDeleteDialog(false)
        setSelectedId('')
    }

    const handleConfirmDelete = async () => {
        try {
            const ids = selectedIds.length > 0 ? selectedIds : [selectedId]

            setOpenDeleteDialog(false)

            const status = await ClientTypeService.deleteClientTypes(ids)

            if (status === 200) {
                if (selectedIds.length > 0) {
                    setRows(rows.filter((row) => !selectedIds.includes(row._id as string)))
                } else {
                    setRows(rows.filter((row) => row._id !== selectedId))
                }
            } else {
                helper.error()
            }
        } catch (err) {
            helper.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="us-list">
            {columns.length > 0 && (
                <DataGrid
                    checkboxSelection={checkboxSelection}
                    getRowId={(row) => row._id as string}
                    columns={columns}
                    rows={rows}
                    rowCount={rows.length}
                    loading={loading}
                    initialState={{
                        pagination: { paginationModel: { pageSize: env.PAGE_SIZE } },
                    }}
                    pageSizeOptions={[env.PAGE_SIZE, 50, 100]}
                    pagination
                    // paginationMode="server" // Client-side pagination for small data
                    onRowSelectionModelChange={(_selectedIds) => {
                        if (_selectedIds.type === 'exclude' && _selectedIds.ids.size === 0) {
                            _selectedIds = { type: 'include', ids: new Set(rows.map((row) => row._id as GridRowId)) }
                        }
                        setSelectedIds(Array.from(new Set(_selectedIds.ids)).map((id) => id.toString()))
                        setReloadColumns(true)
                    }}
                    disableRowSelectionOnClick
                />
            )}

            <Dialog disableEscapeKeyDown maxWidth="xs" open={openDeleteDialog}>
                <DialogTitle className="dialog-header">{commonStrings.CONFIRM_TITLE}</DialogTitle>
                <DialogContent className="dialog-content">{selectedIds.length === 0 ? strings.DELETE_CLIENT_TYPE : strings.DELETE_CLIENT_TYPES}</DialogContent>
                <DialogActions className="dialog-actions">
                    <Button onClick={handleCancelDelete} variant="contained" className="btn-secondary">
                        {commonStrings.CANCEL}
                    </Button>
                    <Button onClick={handleConfirmDelete} variant="contained" color="error">
                        {commonStrings.DELETE}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default ClientTypeList
