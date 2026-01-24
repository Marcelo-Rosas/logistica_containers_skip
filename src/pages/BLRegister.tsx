import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Upload,
  FileText,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Box,
} from 'lucide-react'
import { getClients, uploadBL, createBL } from '@/lib/mock-service'
import { Client } from '@/lib/types'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export default function BLRegister() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extractedData, setExtractedData] = useState<any>(null)

  useEffect(() => {
    getClients().then(setClients)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file || !selectedClient) {
      // Trigger shake animation via DOM manipulation or just toast
      const card = document.getElementById('upload-card')
      card?.classList.add('animate-shake')
      setTimeout(() => card?.classList.remove('animate-shake'), 500)
      toast.error('Selecione um cliente e um arquivo PDF.')
      return
    }

    setUploading(true)
    setProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + 10
      })
    }, 200)

    try {
      const data = await uploadBL(file, selectedClient)
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => {
        setExtractedData(data)
        setStep(2)
        setUploading(false)
      }, 500)
    } catch (e) {
      clearInterval(interval)
      setUploading(false)
      toast.error('Erro ao processar arquivo.')
    }
  }

  const handleConfirm = async () => {
    try {
      await createBL(extractedData)
      toast.success('BL Cadastrado com sucesso!')
      navigate('/bl')
    } catch (e) {
      toast.error('Erro ao criar BL.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Cadastro de BL</h2>
        <p className="text-muted-foreground">
          Importação automática via OCR para integridade de dados
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full border text-sm font-medium transition-colors',
              step >= 1
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-muted-foreground',
            )}
          >
            1
          </div>
          <div
            className={cn(
              'h-1 w-16 rounded-full transition-colors',
              step >= 2 ? 'bg-primary' : 'bg-muted',
            )}
          ></div>
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full border text-sm font-medium transition-colors',
              step >= 2
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-muted-foreground',
            )}
          >
            2
          </div>
          <div
            className={cn(
              'h-1 w-16 rounded-full transition-colors',
              step >= 3 ? 'bg-primary' : 'bg-muted',
            )}
          ></div>
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full border text-sm font-medium transition-colors',
              step >= 3
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-muted-foreground',
            )}
          >
            3
          </div>
        </div>
      </div>

      {step === 1 && (
        <Card
          id="upload-card"
          className="border-dashed border-2 shadow-none hover:border-primary/50 transition-colors"
        >
          <CardHeader>
            <CardTitle>Upload do Documento</CardTitle>
            <CardDescription>
              Selecione o cliente e envie o arquivo PDF do Bill of Lading.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Cliente / Importador</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Arquivo BL (PDF)</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Clique para enviar</span>{' '}
                      ou arraste e solte
                    </p>
                    <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                    {file && (
                      <p className="mt-4 text-sm font-medium text-primary">
                        {file.name}
                      </p>
                    )}
                  </div>
                  <Input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            {uploading && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex justify-between text-xs">
                  <span>Processando OCR...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {uploading ? 'Processando' : 'Extrair Dados'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && extractedData && (
        <div className="space-y-6 animate-fade-in-up">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Revisão de Dados Extraídos
              </CardTitle>
              <CardDescription>
                Verifique se as informações correspondem ao documento original.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  Número BL
                </Label>
                <div className="font-mono text-lg font-bold">
                  {extractedData.number}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  Navio / Viagem
                </Label>
                <div className="font-medium">
                  {extractedData.vessel} / {extractedData.voyage}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  Porto de Origem
                </Label>
                <div className="font-medium">
                  {extractedData.port_of_loading}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  Porto de Destino
                </Label>
                <div className="font-medium">
                  {extractedData.port_of_discharge}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  Peso Total
                </Label>
                <div className="font-medium">
                  {extractedData.total_weight_kg.toLocaleString()} kg
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  Volume Total
                </Label>
                <div className="font-medium">
                  {extractedData.total_volume_m3.toLocaleString()} m³
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">
                Containers Identificados ({extractedData.containers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {extractedData.containers.map((c: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-white rounded border shadow-sm animate-pulse-subtle"
                  >
                    <div className="flex items-center gap-3">
                      <Box className="h-4 w-4 text-blue-500" />
                      <span className="font-mono font-bold">{c.codigo}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100">
                        {c.tipo}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Lacre: {c.seal}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Voltar
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirmar Cadastro
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
