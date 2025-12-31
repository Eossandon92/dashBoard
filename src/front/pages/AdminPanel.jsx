import { useMemo, useState } from "react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { ArrowUp, Pencil, Trash2, Eye } from "lucide-react";

/* ===============================
   DATA DE EJEMPLO (mock)
   luego viene del backend
================================ */
const condominiosData = [
    {
        id: 1,
        nombre: "Condominio Los Álamos",
        unidades: 120,
        comuna: "La Florida",
        estado: "Activo",
    },
    {
        id: 2,
        nombre: "Edificio San Martín",
        unidades: 80,
        comuna: "Santiago Centro",
        estado: "Moroso",
    },
    {
        id: 3,
        nombre: "Condominio Vista Norte",
        unidades: 200,
        comuna: "Ñuñoa",
        estado: "Activo",
    },
];

/* ===============================
   COMPONENTE
================================ */
export default function CondominiosTable() {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState({
        key: "nombre",
        order: "asc",
    });

    /* ===============================
       FILTRO + ORDEN
    ================================ */
    const filteredData = useMemo(() => {
        return condominiosData
            .filter((c) => {
                const value = search.toLowerCase();
                return (
                    c.nombre.toLowerCase().includes(value) ||
                    c.comuna.toLowerCase().includes(value)
                );
            })
            .sort((a, b) => {
                if (sort.order === "asc") {
                    return a[sort.key] > b[sort.key] ? 1 : -1;
                }
                return a[sort.key] < b[sort.key] ? 1 : -1;
            });
    }, [search, sort]);

    /* ===============================
       RENDER
    ================================ */
    return (
        <div className="mx-auto my-6 w-full max-w-7xl rounded-lg border bg-background">
            {/* HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b p-4">
                <h1 className="text-xl font-bold">Condominios</h1>

                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Buscar condominio..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-[220px]"
                    />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <ArrowUp className="size-4 mr-2" />
                                Ordenar
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuRadioGroup
                                value={sort.key}
                                onValueChange={(key) =>
                                    setSort({ key, order: sort.order })
                                }
                            >
                                <DropdownMenuRadioItem value="nombre">
                                    Nombre
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="unidades">
                                    Unidades
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuRadioGroup
                                value={sort.order}
                                onValueChange={(order) =>
                                    setSort({ key: sort.key, order })
                                }
                            >
                                <DropdownMenuRadioItem value="asc">
                                    Ascendente
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="desc">
                                    Descendente
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* TABLE */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="text-right">Unidades</TableHead>
                        <TableHead>Comuna</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {filteredData.map((c) => (
                        <TableRow key={c.id}>
                            <TableCell className="font-medium">
                                {c.nombre}
                            </TableCell>

                            <TableCell className="text-right">
                                {c.unidades}
                            </TableCell>

                            <TableCell>{c.comuna}</TableCell>

                            <TableCell>
                                <Badge
                                    variant={
                                        c.estado === "Activo"
                                            ? "default"
                                            : "destructive"
                                    }
                                >
                                    {c.estado}
                                </Badge>
                            </TableCell>

                            <TableCell className="flex justify-end gap-2">
                                <Button size="icon" variant="ghost">
                                    <Eye className="size-4" />
                                </Button>
                                <Button size="icon" variant="ghost">
                                    <Pencil className="size-4" />
                                </Button>
                                <Button size="icon" variant="ghost">
                                    <Trash2 className="size-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
