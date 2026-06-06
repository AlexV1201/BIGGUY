import { useState } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, Upload, FileText, Trash2, Download, Eye, Brain, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface StudyFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category: string;
  hasSummary: boolean;
}

export function Library() {
  const [files, setFiles] = useState<StudyFile[]>([
    {
      id: "1",
      name: "Introducción a la Química Orgánica.pdf",
      type: "PDF",
      size: "2.4 MB",
      uploadDate: "2026-05-25",
      category: "Química",
      hasSummary: true,
    },
    {
      id: "2",
      name: "Historia Mundial Siglo XX.docx",
      type: "DOCX",
      size: "1.8 MB",
      uploadDate: "2026-05-24",
      category: "Historia",
      hasSummary: false,
    },
    {
      id: "3",
      name: "Matemáticas Avanzadas - Cálculo.pdf",
      type: "PDF",
      size: "3.2 MB",
      uploadDate: "2026-05-23",
      category: "Matemáticas",
      hasSummary: true,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
      const newFiles: StudyFile[] = Array.from(uploadedFiles).map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        type: file.name.split(".").pop()?.toUpperCase() || "FILE",
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadDate: new Date().toISOString().split("T")[0],
        category: "General",
        hasSummary: false,
      }));

      setFiles([...files, ...newFiles]);
      setIsUploadDialogOpen(false);
      toast.success(`${newFiles.length} archivo(s) subido(s) correctamente`);
    }
  };

  const handleDelete = (id: string) => {
    setFiles(files.filter((file) => file.id !== id));
    toast.success("Archivo eliminado");
  };

  const generateSummary = (id: string) => {
    setFiles(files.map((file) => 
      file.id === id ? { ...file, hasSummary: true } : file
    ));
    toast.success("Resumen generado con IA");
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || file.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...Array.from(new Set(files.map((f) => f.category)))];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Dashboard
              </Link>
            </Button>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Subir Archivo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Subir Material de Estudio</DialogTitle>
                  <DialogDescription>
                    Sube archivos PDF, DOCX, TXT o imágenes para guardarlos en tu biblioteca
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file">Seleccionar Archivo(s)</Label>
                    <Input
                      id="file"
                      type="file"
                      multiple
                      accept=".pdf,.docx,.txt,.jpg,.png"
                      onChange={handleFileUpload}
                      className="mt-2"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Biblioteca de Estudio
          </h1>
          <p className="text-slate-600">
            Organiza y gestiona todos tus materiales de estudio
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar archivos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "Todas las categorías" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">
                No se encontraron archivos
              </h3>
              <p className="text-slate-500 mb-4">
                Sube tu primer archivo para comenzar
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)} className="gap-2">
                <Upload className="h-4 w-4" />
                Subir Archivo
              </Button>
            </div>
          ) : (
            filteredFiles.map((file) => (
              <Card key={file.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-base line-clamp-2">
                        {file.name}
                      </CardTitle>
                    </div>
                    <Badge variant="outline">{file.type}</Badge>
                  </div>
                  <CardDescription>
                    {file.size} • {new Date(file.uploadDate).toLocaleDateString("es")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex gap-2 flex-wrap">
                    <Badge>{file.category}</Badge>
                    {file.hasSummary && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Resumido
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="h-3 w-3" />
                    Ver
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Download className="h-3 w-3" />
                    Descargar
                  </Button>
                  {!file.hasSummary && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1"
                      onClick={() => generateSummary(file.id)}
                    >
                      <Brain className="h-3 w-3" />
                      Resumir
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(file.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                    Eliminar
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
