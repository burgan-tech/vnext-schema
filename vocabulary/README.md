# Amorphie JSON Schema Vocabulary

Amorphie JSON Schema Vocabulary, standart JSON Schema'yı genişleten özel bir meta-vocabulary'dir. Çok dilli destek, platform entegrasyonu ve gelişmiş UI üretimi için Amorphie'ye özel yetenekler sağlar.

## İçindekiler

- [Genel Bakış](#genel-bakış)
- [Kullanım](#kullanım)
- [Özellikler](#özellikler)
  - [x-amorphie-labels](#x-amorphie-labels)
  - [x-amorphie-errorMessages](#x-amorphie-errormessages)
  - [x-amorphie-lov](#x-amorphie-lov)
  - [x-amorphie-enum](#x-amorphie-enum)
  - [x-amorphie-validation](#x-amorphie-validation)
  - [x-amorphie-roles](#x-amorphie-roles)
  - [x-amorphie-encryption](#x-amorphie-encryption)
  - [x-amorphie-ui](#x-amorphie-ui)
  - [x-amorphie-conditional](#x-amorphie-conditional)

## Genel Bakış

Amorphie Vocabulary, JSON Schema tanımlarınıza şu yetenekleri ekler:

- 🌍 **Çok Dilli Destek**: Etiketler, hata mesajları ve enum değerleri için yerelleştirme
- 🔗 **Platform Entegrasyonu**: Amorphie LOV (List of Values) sistemi ile entegrasyon
- 🎨 **UI Üretimi**: Schema'dan doğrudan zengin kullanıcı arayüzleri üretme
- 🔐 **Güvenlik**: Rol tabanlı erişim kontrolü ve şifreleme desteği
- ✅ **Doğrulama**: Özel iş kuralları doğrulaması
- 🎯 **Koşullu Mantık**: Diğer alan değerlerine göre dinamik davranış

## Kullanım

Schema dosyanızın başına vocabulary referansını ekleyin:

```json
{
  "$schema": "https://amorphie.io/meta/amorphie-vocabulary",
  "$id": "https://example.com/schemas/my-schema",
  "type": "object",
  "properties": {
    // ... özellikleriniz
  }
}
```

## Özellikler

### x-amorphie-labels

Alanlar, özellikler veya schema elemanları için çok dilli etiketler tanımlar.

**Tip:** `object`  
**Zorunlu:** Hayır

**Yapı:**
- Anahtar: Dil kodu (örn: `tr`, `en`, `ar`, `tr-TR`, `en-US`)
- Değer: Etiket metni (string)

**Örnek:**

```json
{
  "type": "string",
  "x-amorphie-labels": {
    "tr": "Kredi Tutarı",
    "en": "Loan Amount",
    "ar": "مبلغ القرض"
  }
}
```

**Dil Kodu Formatı:**
- ISO 639-1 dil kodu: `tr`, `en`, `ar`
- İsteğe bağlı ISO 3166-1 ülke kodu: `tr-TR`, `en-US`, `ar-SA`

---

### x-amorphie-errorMessages

Doğrulama hataları için çok dilli hata mesajları tanımlar.

**Tip:** `object`  
**Zorunlu:** Hayır

**Yapı:**
- İlk seviye: Hata tipi (örn: `required`, `minimum`, `maximum`, `format`)
- İkinci seviye: Dil kodu
- Değer: Hata mesajı metni

**Örnek:**

```json
{
  "type": "number",
  "minimum": 1000,
  "x-amorphie-errorMessages": {
    "required": {
      "tr": "Tutar alanı zorunludur",
      "en": "Amount field is required"
    },
    "minimum": {
      "tr": "Minimum tutar 1,000 TL olmalıdır",
      "en": "Minimum amount should be 1,000 TL"
    }
  }
}
```

**Desteklenen Hata Tipleri:**
- `required`: Zorunlu alan hatası
- `minimum`: Minimum değer hatası
- `maximum`: Maksimum değer hatası
- `minLength`: Minimum uzunluk hatası
- `maxLength`: Maksimum uzunluk hatası
- `pattern`: Pattern eşleşme hatası
- `format`: Format hatası
- `enum`: Enum değer hatası
- Ve diğer JSON Schema validation hataları

---

### x-amorphie-lov

Dinamik dropdown/select seçenekleri için Amorphie List of Values (LOV) entegrasyonu.

**Tip:** `object`  
**Zorunlu:** Evet (`source` zorunlu)

**Özellikler:**

| Özellik | Tip | Zorunlu | Açıklama |
|---------|-----|---------|----------|
| `source` | `object` | ✅ | LOV kaynağı tanımı |
| `valueField` | `string` | ❌ | JSONPath ifadesi - değer alanı |
| `displayField` | `string` | ❌ | JSONPath ifadesi - görünen etiket |
| `filter` | `object` | ❌ | LOV kaynağına gönderilecek filtre parametreleri |
| `cache` | `object` | ❌ | Cache yapılandırması |

**source Özellikleri:**

| Özellik | Tip | Zorunlu | Açıklama |
|---------|-----|---------|----------|
| `key` | `string` | ✅ | Fonksiyon veya workflow key identifier |
| `version` | `string` | ✅ | Versiyon (Major.Minor.Patch formatında) |
| `domain` | `string` | ✅ | Domain identifier |
| `flow` | `string` | ✅ | Flow tipi (genellikle `function`) |
| `flowVersion` | `string` | ✅ | Flow versiyonu |

**Örnek:**

```json
{
  "type": "string",
  "x-amorphie-lov": {
    "source": {
      "key": "get-cities",
      "version": "1.1.0",
      "domain": "shared",
      "flow": "function",
      "flowVersion": "1.0.0"
    },
    "valueField": "$.response.data.code",
    "displayField": "$.response.data.name",
    "filter": {
      "country": "TR"
    },
    "cache": {
      "enabled": true,
      "ttl": 3600
    }
  }
}
```

**JSONPath Formatı:**
- `valueField` ve `displayField` JSONPath ifadeleri `$.` ile başlamalıdır
- Örnekler: `$.response.data.code`, `$.data.id`, `$.response.data.name`

---

### x-amorphie-enum

Enum değerleri için yerelleştirilmiş görünen isimler tanımlar.

**Tip:** `object`  
**Zorunlu:** Hayır

**Yapı:**
- İlk seviye: Enum değeri
- İkinci seviye: Dil kodu
- Değer: Görünen etiket metni

**Örnek:**

```json
{
  "type": "string",
  "enum": ["individual", "corporate"],
  "x-amorphie-enum": {
    "individual": {
      "tr": "Bireysel",
      "en": "Individual"
    },
    "corporate": {
      "tr": "Kurumsal",
      "en": "Corporate"
    }
  }
}
```

**Not:** Bu özellik, JSON Schema'nın standart `enum` özelliği ile birlikte kullanılmalıdır.

---

### x-amorphie-validation

Özel iş kuralları doğrulaması tanımlar.

**Tip:** `object`  
**Zorunlu:** Evet (`rule` zorunlu)

**Özellikler:**

| Özellik | Tip | Zorunlu | Açıklama |
|---------|-----|---------|----------|
| `rule` | `string` | ✅ | Doğrulama kuralı fonksiyon adı |
| `parameters` | `object` | ❌ | Doğrulama kuralına gönderilecek parametreler |
| `errorMessages` | `object` | ❌ | Çok dilli hata mesajları |

**Örnek:**

```json
{
  "type": "string",
  "x-amorphie-validation": {
    "rule": "validateTurkishTaxId",
    "parameters": {
      "country": "TR"
    },
    "errorMessages": {
      "tr": "Geçerli bir vergi numarası giriniz",
      "en": "Please enter a valid tax ID"
    }
  }
}
```

**Yaygın Doğrulama Kuralları:**
- `validateTurkishTaxId`: Türk vergi numarası doğrulaması
- `validateIBAN`: IBAN doğrulaması
- `validateEmailDomain`: E-posta domain doğrulaması
- `validateTCKN`: Türk kimlik numarası doğrulaması

---

### x-amorphie-roles

Rol tabanlı erişim kontrolü tanımlar. Hangi rollerin bu alana erişebileceğini belirler.

**Tip:** `array`  
**Zorunlu:** Hayır

**Varsayılan Davranış:** Eğer tanımlanmazsa, tüm roller erişebilir (kısıtlama yok).

**Array Elemanları:**

Her eleman bir `object` olmalıdır:

| Özellik | Tip | Zorunlu | Açıklama |
|---------|-----|---------|----------|
| `role` | `string` | ✅ | Rol identifier (örn: `morph-idm.maker`) |
| `allowance` | `string` | ✅ | Erişim izni: `allow` veya `deny` |

**Örnek:**

```json
{
  "type": "string",
  "x-amorphie-roles": [
    { "role": "morph-idm.maker", "allowance": "allow" },
    { "role": "morph-idm.approver", "allowance": "allow" },
    { "role": "morph-idm.viewer", "allowance": "allow" }
  ]
}
```

**Rol Formatı:**
- Küçük harf, rakam, nokta ve tire içerebilir
- Örnekler: `morph-idm.maker`, `morph-idm.approver`, `morph-idm.viewer`

**Erişim Kontrolü:**
- `allow`: Rol bu alana erişebilir
- `deny`: Rol bu alana erişemez

---

### x-amorphie-encryption

Hassas veri alanları için şifreleme yapılandırması.

**Tip:** `object`  
**Zorunlu:** Evet (`type` zorunlu)

**Özellikler:**

| Özellik | Tip | Zorunlu | Açıklama |
|---------|-----|---------|----------|
| `type` | `string` | ✅ | Şifreleme seviyesi/tipi |

**Şifreleme Tipleri:**

| Tip | Açıklama |
|-----|----------|
| `none` | Şifreleme yok - veri düz metin olarak saklanır ve iletilir |
| `transport` | Transport seviyesi şifreleme - veri loglarda ve ara katmanlarda şifrelenir, ancak veritabanında düz metin olarak saklanır |
| `persisted` | Kalıcı şifreleme - veri veritabanı seviyesinde şifrelenir ve rest durumunda şifreli kalır |

**Örnek:**

```json
{
  "type": "string",
  "x-amorphie-encryption": {
    "type": "persisted"
  }
}
```

**Kullanım Senaryoları:**
- `none`: Genel veriler için (ad, soyad, vb.)
- `transport`: Hassas veriler için (e-posta, telefon) - loglarda maskelenir
- `persisted`: Çok hassas veriler için (kredi kartı, TCKN, vergi numarası) - veritabanında şifreli

---

### x-amorphie-ui

UI üretimi için ipuçları ve metadata.

**Tip:** `object`  
**Zorunlu:** Hayır

**Özellikler:**

| Özellik | Tip | Zorunlu | Açıklama |
|---------|-----|---------|----------|
| `widget` | `string` | ❌ | Tercih edilen UI widget tipi |
| `configuration` | `object` | ❌ | Tüm UI ile ilgili ayarları içeren kompleks yapılandırma objesi |

#### widget

Desteklenen widget tipleri:

- `text`: Metin girişi
- `textarea`: Çok satırlı metin girişi
- `number`: Sayı girişi
- `date`: Tarih seçici
- `datetime`: Tarih ve saat seçici
- `time`: Saat seçici
- `select`: Dropdown seçim
- `multiselect`: Çoklu seçim dropdown
- `checkbox`: Checkbox
- `radio`: Radio button
- `file`: Dosya yükleme
- `image`: Resim yükleme
- `color`: Renk seçici
- `range`: Aralık slider
- `password`: Şifre girişi
- `email`: E-posta girişi
- `url`: URL girişi
- `tel`: Telefon numarası girişi

#### configuration

Kompleks yapılandırma objesi aşağıdaki özellikleri içerir:

##### placeholder

Çok dilli placeholder metni.

```json
{
  "placeholder": {
    "tr": "Örn: 50.000",
    "en": "E.g: 50,000"
  }
}
```

##### helpText

Çok dilli yardım metni veya tooltip.

```json
{
  "helpText": {
    "tr": "Kredi tutarını TL cinsinden giriniz",
    "en": "Enter the loan amount in TL"
  }
}
```

##### format

UI'ye özel formatlama seçenekleri.

| Özellik | Tip | Açıklama |
|---------|-----|----------|
| `mask` | `string` | Input mask pattern (örn: telefon numaraları, tarihler için) |
| `prefix` | `string` | Değerden önce gösterilecek prefix (örn: para birimi sembolü) |
| `suffix` | `string` | Değerden sonra gösterilecek suffix (örn: birim) |
| `decimalPlaces` | `integer` | Gösterilecek ondalık basamak sayısı (0-10) |
| `thousandSeparator` | `string` | Binlik ayırıcı karakter (max 1 karakter) |
| `decimalSeparator` | `string` | Ondalık ayırıcı karakter (max 1 karakter) |

**Örnek:**

```json
{
  "format": {
    "mask": "(999) 999-9999",
    "prefix": "₺",
    "thousandSeparator": ".",
    "decimalSeparator": ",",
    "decimalPlaces": 2
  }
}
```

##### layout

Layout ve stil ipuçları.

| Özellik | Tip | Açıklama |
|---------|-----|----------|
| `width` | `string` | CSS width değeri veya grid column span (örn: `100%`, `50%`, `1fr`, `2`) |
| `order` | `integer` | Görüntülenme sırası/pozisyonu (minimum: 0) |
| `hidden` | `boolean` | Alan varsayılan olarak gizli mi? (default: `false`) |
| `readonly` | `boolean` | Alan salt okunur mu? (default: `false`) |
| `disabled` | `boolean` | Alan devre dışı mı? (default: `false`) |

**Örnek:**

```json
{
  "layout": {
    "width": "50%",
    "order": 1,
    "hidden": false,
    "readonly": false,
    "disabled": false
  }
}
```

##### validation

Client-side doğrulama ipuçları.

| Özellik | Tip | Default | Açıklama |
|---------|-----|---------|----------|
| `validateOnBlur` | `boolean` | `true` | Blur event'inde doğrulama yapılsın mı? |
| `validateOnChange` | `boolean` | `false` | Change event'inde doğrulama yapılsın mı? |
| `showErrorOnMount` | `boolean` | `false` | Mount anında hatalar gösterilsin mi? |

**Örnek:**

```json
{
  "validation": {
    "validateOnBlur": true,
    "validateOnChange": false,
    "showErrorOnMount": false
  }
}
```

**Tam Örnek:**

```json
{
  "type": "number",
  "x-amorphie-ui": {
    "widget": "number",
    "configuration": {
      "placeholder": {
        "tr": "Örn: 50.000",
        "en": "E.g: 50,000"
      },
      "helpText": {
        "tr": "Kredi tutarını TL cinsinden giriniz",
        "en": "Enter the loan amount in TL"
      },
      "format": {
        "prefix": "₺",
        "thousandSeparator": ".",
        "decimalSeparator": ",",
        "decimalPlaces": 2
      },
      "layout": {
        "width": "50%",
        "order": 1
      },
      "validation": {
        "validateOnBlur": true,
        "validateOnChange": false
      }
    }
  }
}
```

---

### x-amorphie-conditional

Diğer alan değerlerine göre koşullu alan görünürlüğü veya davranışı tanımlar.

**Tip:** `object`  
**Zorunlu:** Hayır

**Özellikler:**

| Özellik | Tip | Açıklama |
|---------|-----|----------|
| `showIf` | `object` | Bu alanı gösterme koşulları |
| `hideIf` | `object` | Bu alanı gizleme koşulları |
| `enableIf` | `object` | Bu alanı etkinleştirme koşulları |
| `disableIf` | `object` | Bu alanı devre dışı bırakma koşulları |

**Koşul Objesi Özellikleri:**

| Özellik | Tip | Zorunlu | Açıklama |
|---------|-----|---------|----------|
| `field` | `string` | ✅ | Kontrol edilecek alan yolu (dot notation destekler) |
| `operator` | `string` | ❌ | Karşılaştırma operatörü (default: `equals`) |
| `value` | `any` | ❌ | Karşılaştırılacak değer(ler) |

**Desteklenen Operatörler:**

- `equals`: Eşittir
- `notEquals`: Eşit değildir
- `in`: Değerler içinde
- `notIn`: Değerler içinde değil
- `greaterThan`: Büyüktür
- `lessThan`: Küçüktür
- `contains`: İçerir (string için)
- `isEmpty`: Boş mu?
- `isNotEmpty`: Boş değil mi?

**Örnekler:**

**showIf - Koşullu Görünürlük:**

```json
{
  "type": "string",
  "x-amorphie-conditional": {
    "showIf": {
      "field": "customerType",
      "operator": "equals",
      "value": "corporate"
    }
  }
}
```

**hideIf - Koşullu Gizleme:**

```json
{
  "type": "string",
  "x-amorphie-conditional": {
    "hideIf": {
      "field": "status",
      "operator": "equals",
      "value": "approved"
    }
  }
}
```

**enableIf - Koşullu Etkinleştirme:**

```json
{
  "type": "string",
  "x-amorphie-conditional": {
    "enableIf": {
      "field": "amount",
      "operator": "greaterThan",
      "value": 0
    }
  }
}
```

**disableIf - Koşullu Devre Dışı Bırakma:**

```json
{
  "type": "string",
  "x-amorphie-conditional": {
    "disableIf": {
      "field": "status",
      "operator": "in",
      "value": ["approved", "rejected"]
    }
  }
}
```

**Nested Field (Dot Notation):**

```json
{
  "type": "string",
  "x-amorphie-conditional": {
    "showIf": {
      "field": "address.country",
      "operator": "equals",
      "value": "TR"
    }
  }
}
```

**isEmpty/isNotEmpty:**

```json
{
  "type": "string",
  "x-amorphie-conditional": {
    "showIf": {
      "field": "customerType",
      "operator": "isNotEmpty"
    }
  }
}
```

---

## Tam Örnek

Tüm özellikleri içeren kapsamlı bir örnek:

```json
{
  "$schema": "https://amorphie.io/meta/amorphie-vocabulary",
  "$id": "https://example.com/schemas/loan-application",
  "title": "Loan Application Schema",
  "type": "object",
  "required": ["amount", "customerType"],
  "properties": {
    "amount": {
      "type": "number",
      "minimum": 1000,
      "maximum": 1000000,
      "x-amorphie-labels": {
        "tr": "Kredi Tutarı",
        "en": "Loan Amount"
      },
      "x-amorphie-errorMessages": {
        "required": {
          "tr": "Tutar alanı zorunludur",
          "en": "Amount field is required"
        },
        "minimum": {
          "tr": "Minimum tutar 1,000 TL olmalıdır",
          "en": "Minimum amount should be 1,000 TL"
        }
      },
      "x-amorphie-ui": {
        "widget": "number",
        "configuration": {
          "placeholder": {
            "tr": "Örn: 50.000",
            "en": "E.g: 50,000"
          },
          "format": {
            "prefix": "₺",
            "thousandSeparator": ".",
            "decimalPlaces": 2
          },
          "layout": {
            "width": "50%",
            "order": 1
          }
        }
      },
      "x-amorphie-roles": [
        { "role": "morph-idm.maker", "allowance": "allow" },
        { "role": "morph-idm.approver", "allowance": "allow" }
      ]
    },
    "city": {
      "type": "string",
      "x-amorphie-labels": {
        "tr": "Şehir",
        "en": "City"
      },
      "x-amorphie-lov": {
        "source": {
          "key": "get-cities",
          "version": "1.1.0",
          "domain": "shared",
          "flow": "function",
          "flowVersion": "1.0.0"
        },
        "valueField": "$.response.data.code",
        "displayField": "$.response.data.name"
      },
      "x-amorphie-ui": {
        "widget": "select",
        "configuration": {
          "placeholder": {
            "tr": "Şehir seçiniz",
            "en": "Select a city"
          }
        }
      }
    },
    "taxId": {
      "type": "string",
      "x-amorphie-labels": {
        "tr": "Vergi Numarası",
        "en": "Tax ID"
      },
      "x-amorphie-validation": {
        "rule": "validateTurkishTaxId",
        "parameters": {
          "country": "TR"
        },
        "errorMessages": {
          "tr": "Geçerli bir vergi numarası giriniz",
          "en": "Please enter a valid tax ID"
        }
      },
      "x-amorphie-encryption": {
        "type": "persisted"
      },
      "x-amorphie-conditional": {
        "showIf": {
          "field": "customerType",
          "operator": "equals",
          "value": "corporate"
        }
      }
    }
  }
}
```

---

## Dil Kodları

Dil kodları ISO 639-1 standardını takip eder:

- **Basit format**: `tr`, `en`, `ar`, `de`, `fr`
- **Ülke kodu ile**: `tr-TR`, `en-US`, `ar-SA`, `de-DE`, `fr-FR`

Pattern: `^[a-z]{2}(-[A-Z]{2})?$`

---

## Notlar

1. Tüm `x-amorphie-*` özellikleri opsiyoneldir. İhtiyacınıza göre kullanabilirsiniz.

2. Vocabulary, standart JSON Schema özellikleriyle uyumludur. Mevcut JSON Schema tanımlarınıza ekleyebilirsiniz.

3. `x-amorphie-roles` tanımlanmazsa, varsayılan olarak tüm roller erişebilir.

4. `x-amorphie-lov` kullanırken, `source` objesi içindeki tüm alanlar zorunludur.

5. `x-amorphie-ui` içinde `widget` ve `configuration` birlikte kullanılabilir veya sadece biri kullanılabilir.

6. Koşullu mantık (`x-amorphie-conditional`) için nested field'lar dot notation ile erişilebilir (örn: `address.country`).

---

## Versiyon

Bu dokümantasyon Amorphie JSON Schema Vocabulary v1.0.0 için hazırlanmıştır.

---

## İletişim ve Destek

Sorularınız veya önerileriniz için lütfen Amorphie platform dokümantasyonuna başvurun.

