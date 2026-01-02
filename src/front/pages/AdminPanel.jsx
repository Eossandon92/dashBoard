import { useEffect, useMemo, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";

/* ===============================
   COLUMNAS
================================ */

const CONDOMINIO_COLUMNS = [
    { key: "nombre", label: "Nombre" },
    { key: "comuna", label: "Comuna" },
    { key: "direccion", label: "Dirección" },
    { key: "total_unidades", label: "Unidades" },
    { key: "email_contacto", label: "Email" },
    { key: "telefono_contacto", label: "Teléfono" },
    { key: "administrador_id", label: "Administrador" },
    { key: "estado", label: "Estado" },
];

const USER_COLUMNS = [
    { key: "first_name", label: "Nombre" },
    { key: "last_name", label: "Apellido" },
    { key: "email", label: "Email" },
    { key: "roles", label: "Roles" },
    { key: "is_active", label: "Estado" },
];

/* ===============================
   COMPONENTE
================================ */

export default function AdminTables() {
    const [activeTable, setActiveTable] = useState("condominios");
    const [data, setData] = useState([]);
    const [roles, setRoles] = useState([]);
    const [admins, setAdmins] = useState([]);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [addingNew, setAddingNew] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newRow, setNewRow] = useState({});

    /* ===============================
       MODELOS VACÍOS
    ================================ */

    const emptyCondominio = {
        nombre: "",
        comuna: "",
        direccion: "",
        total_unidades: "",
        email_contacto: "",
        telefono_contacto: "",
        estado: "Activo",
        administrador_id: "",
    };

    const emptyUser = {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        roles: [],
        is_active: true,
    };

    /* ===============================
       FETCH ROLES
    ================================ */

    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/roles")
            .then((res) => res.json())
            .then((data) => setRoles(data));
    }, []);

    /* ===============================
       FETCH ADMINS
    ================================ */

    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/users")
            .then((res) => res.json())
            .then((users) => {
                setAdmins(users.filter((u) => u.roles?.includes("ADMIN")));
            });
    }, []);

    /* ===============================
       FETCH DATA
    ================================ */

    useEffect(() => {
        setLoading(true);
        setAddingNew(false);
        setEditingId(null);

        const url =
            activeTable === "condominios"
                ? "http://127.0.0.1:5000/api/condominios"
                : "http://127.0.0.1:5000/api/users";

        fetch(url)
            .then((res) => res.json())
            .then((json) => setData(json))
            .finally(() => setLoading(false));

        setNewRow(activeTable === "condominios" ? emptyCondominio : emptyUser);
    }, [activeTable]);

    const columns =
        activeTable === "condominios" ? CONDOMINIO_COLUMNS : USER_COLUMNS;

    const baseUrl =
        activeTable === "condominios"
            ? "http://127.0.0.1:5000/api/condominios"
            : "http://127.0.0.1:5000/api/users";

    /* ===============================
       FILTRO
    ================================ */

    const filteredData = useMemo(() => {
        const value = search.toLowerCase();
        return data.filter((row) =>
            columns.some((col) =>
                row[col.key]?.toString().toLowerCase().includes(value)
            )
        );
    }, [data, search, columns]);

    /* ===============================
       SAVE
    ================================ */

    const handleSave = async () => {
        if (
            activeTable === "condominios" &&
            !newRow.administrador_id
        ) {
            alert("Debe seleccionar un administrador");
            return;
        }

        const isEdit = Boolean(editingId);
        const url = isEdit ? `${baseUrl}/${editingId}` : baseUrl;
        const method = isEdit ? "PUT" : "POST";

        const payload =
            activeTable === "condominios"
                ? {
                    ...newRow,
                    total_unidades: Number(newRow.total_unidades),
                }
                : isEdit
                    ? {
                        first_name: newRow.first_name,
                        last_name: newRow.last_name,
                        email: newRow.email,
                        roles: newRow.roles,
                        is_active: newRow.is_active,
                    }
                    : newRow;

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        setAddingNew(false);
        setEditingId(null);
        setActiveTable(activeTable);
    };

    /* ===============================
       DELETE
    ================================ */

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar registro?")) return;
        await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
        setData(data.filter((d) => d.id !== id));
    };

    /* ===============================
       RENDER
    ================================ */

    return (
        <div className="mx-auto my-6 w-full max-w-7xl rounded-lg border bg-background">
            <div className="flex gap-2 border-b p-4">
                <Button
                    variant={activeTable === "condominios" ? "default" : "outline"}
                    onClick={() => setActiveTable("condominios")}
                >
                    Condominios
                </Button>

                <Button
                    variant={activeTable === "users" ? "default" : "outline"}
                    onClick={() => setActiveTable("users")}
                >
                    Usuarios
                </Button>

                <Button
                    className="ml-auto"
                    onClick={() => {
                        setAddingNew(true);
                        setEditingId(null);
                        setNewRow(
                            activeTable === "condominios"
                                ? emptyCondominio
                                : emptyUser
                        );
                    }}
                >
                    <Plus className="mr-2 size-4" /> Nuevo
                </Button>
            </div>

            <div className="flex justify-between border-b p-4">
                <h1 className="text-xl font-bold capitalize">{activeTable}</h1>
                <Input
                    placeholder="Buscar..."
                    className="w-[220px]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="p-6 text-center">Cargando...</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((c) => (
                                <TableHead key={c.key}>{c.label}</TableHead>
                            ))}
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {addingNew && (
                            <TableRow className="bg-muted/40">
                                {columns.map((col) => (
                                    <TableCell key={col.key}>
                                        {col.key === "administrador_id" ? (
                                            <select
                                                className="w-full rounded-md border px-2 py-1"
                                                value={newRow.administrador_id}
                                                onChange={(e) =>
                                                    setNewRow({
                                                        ...newRow,
                                                        administrador_id: Number(
                                                            e.target.value
                                                        ),
                                                    })
                                                }
                                            >
                                                <option value="">
                                                    Seleccione administrador
                                                </option>
                                                {admins.map((admin) => (
                                                    <option
                                                        key={admin.id}
                                                        value={admin.id}
                                                    >
                                                        {admin.first_name}{" "}
                                                        {admin.last_name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : col.key === "roles" ? (
                                            <select
                                                multiple
                                                className="w-full min-h-[90px] rounded-md border px-2 py-1"
                                                value={newRow.roles}
                                                onChange={(e) =>
                                                    setNewRow({
                                                        ...newRow,
                                                        roles: Array.from(
                                                            e.target
                                                                .selectedOptions,
                                                            (o) => o.value
                                                        ),
                                                    })
                                                }
                                            >
                                                {roles.map((role) => (
                                                    <option
                                                        key={role.id}
                                                        value={role.name}
                                                    >
                                                        {role.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : col.key === "is_active" ? (
                                            <select
                                                className="w-full rounded-md border px-2 py-1"
                                                value={newRow.is_active}
                                                onChange={(e) =>
                                                    setNewRow({
                                                        ...newRow,
                                                        is_active:
                                                            e.target.value ===
                                                            "true",
                                                    })
                                                }
                                            >
                                                <option value="true">
                                                    Activo
                                                </option>
                                                <option value="false">
                                                    Inactivo
                                                </option>
                                            </select>
                                        ) : (
                                            <Input
                                                value={newRow[col.key] ?? ""}
                                                onChange={(e) =>
                                                    setNewRow({
                                                        ...newRow,
                                                        [col.key]:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        )}
                                    </TableCell>
                                ))}

                                <TableCell className="flex justify-end gap-2">
                                    <Button size="sm" onClick={handleSave}>
                                        Guardar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setAddingNew(false)}
                                    >
                                        Cancelar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )}

                        {filteredData.map((row) => (
                            <TableRow key={row.id}>
                                {columns.map((col) => (
                                    <TableCell key={col.key}>
                                        {col.key === "roles"
                                            ? row.roles?.join(", ")
                                            : col.key === "is_active"
                                                ? (
                                                    <Badge
                                                        variant={
                                                            row.is_active
                                                                ? "default"
                                                                : "destructive"
                                                        }
                                                    >
                                                        {row.is_active
                                                            ? "Activo"
                                                            : "Inactivo"}
                                                    </Badge>
                                                )
                                                : col.key === "estado"
                                                    ? <Badge>{row.estado}</Badge>
                                                    : row[col.key] ?? "-"}
                                    </TableCell>
                                ))}

                                <TableCell className="flex justify-end gap-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => {
                                            setEditingId(row.id);
                                            setAddingNew(true);
                                            setNewRow(row);
                                        }}
                                    >
                                        <Pencil className="size-4" />
                                    </Button>

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() =>
                                            handleDelete(row.id)
                                        }
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
