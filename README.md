# TestBabylon

##Premissas
Separar por módulos

##Fluxo

###Ler json
    Abrir cena [DONE]
        Converter cada sku [DONE]
            estrutura
            coating
            skus
    Montar e converter estrutura
    produzir HDR da cena para reflexos

###Montar json com estrutura
    
    Lista de objetos com posição e link 
        utilizar a mesma estrutura do job de cena
        mesmo objetos repetidos serão renderizados novamente
    grupos de interação (segundo passo)

###Upload de assets (mockado no momento para ter um fluxo local)
    Jogar no bucket temporário AWS

###Montagem do script js
    Identificar blocos
        Importação de skus
    Camera
    Skus e estrutura
    Interação


##Observações e melhorias
    mensagem de loading enquanto carrega a cena

##TODO
    PEGAR A CENA BASE