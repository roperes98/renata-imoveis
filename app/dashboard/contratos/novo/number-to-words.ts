// Função para converter números para extenso em português brasileiro

const unidades = [
  "zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
  "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"
];

const dezenas = [
  "", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"
];

const centenas = [
  "", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"
];

function convertHundreds(num: number): string {
  if (num === 0) return "";
  if (num === 100) return "cem";
  
  const c = Math.floor(num / 100);
  const resto = num % 100;
  
  let result = "";
  
  if (c > 0) {
    result = centenas[c];
  }
  
  if (resto > 0) {
    if (result) result += " e ";
    if (resto < 20) {
      result += unidades[resto];
    } else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      result += dezenas[d];
      if (u > 0) {
        result += " e " + unidades[u];
      }
    }
  }
  
  return result;
}

function convertGroup(num: number, singular: string, plural: string): string {
  if (num === 0) return "";
  if (num === 1) return `um ${singular}`;
  
  const hundreds = convertHundreds(num);
  return `${hundreds} ${plural}`;
}

export function numberToWords(value: number): string {
  if (value === 0) return "zero reais";
  
  const integerPart = Math.floor(value);
  const decimalPart = Math.round((value - integerPart) * 100);
  
  if (integerPart === 0 && decimalPart === 0) {
    return "zero reais";
  }
  
  let result = "";
  
  // Milhões
  const milhoes = Math.floor(integerPart / 1000000);
  if (milhoes > 0) {
    if (milhoes === 1) {
      result += "um milhão";
    } else {
      result += convertGroup(milhoes, "milhão", "milhões");
    }
  }
  
  // Milhares
  const milhares = Math.floor((integerPart % 1000000) / 1000);
  if (milhares > 0) {
    if (result) result += " ";
    if (milhares === 1) {
      result += "mil";
    } else {
      const milharesText = convertHundreds(milhares);
      result += milharesText + " mil";
    }
  }
  
  // Centenas, dezenas e unidades
  const resto = integerPart % 1000;
  if (resto > 0) {
    if (result) result += " ";
    result += convertHundreds(resto);
  }
  
  // Plural de reais
  if (integerPart === 1) {
    result += " real";
  } else {
    result += " reais";
  }
  
  // Centavos
  if (decimalPart > 0) {
    result += " e ";
    if (decimalPart < 20) {
      result += unidades[decimalPart];
    } else {
      const d = Math.floor(decimalPart / 10);
      const u = decimalPart % 10;
      result += dezenas[d];
      if (u > 0) {
        result += " e " + unidades[u];
      }
    }
    
    if (decimalPart === 1) {
      result += " centavo";
    } else {
      result += " centavos";
    }
  }
  
  // Capitalizar primeira letra
  return result.charAt(0).toUpperCase() + result.slice(1);
}


