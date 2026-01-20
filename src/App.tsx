import { Building2, Target, Users, Shield, FileCheck, Phone, Mail, MapPin } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg border-b-4 border-yellow-600">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/image.png" alt="AP-ARDA Logo" className="h-20 w-20 object-contain" />
              <div>
                <h1 className="text-3xl font-bold tracking-wide">AP-ARDA</h1>
                <p className="text-sm text-yellow-400 mt-1">Andhra Pradesh - Amaravati Real Estate Developers Association</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="relative bg-gradient-to-r from-blue-900 to-blue-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <img src="/image.png" alt="AP-ARDA" className="h-48 w-48 object-contain drop-shadow-2xl" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              రాజధాని అమరావతి రియల్ ఎస్టేట్ అభివృద్ధి సంఘం
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
              రాజధాని ప్రాంతం మరియు ఆంధ్రప్రదేశ్లో రియల్ ఎస్టేట్ రంగాన్ని సమర్థవంతంగా, బాధ్యతతో అభివృద్ధి చేయడానికి ఏర్పడిన ప్రొఫెషనల్ డెవలపర్ల సంఘం
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-lg p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-900 p-3 rounded-full">
                  <Target className="h-8 w-8 text-yellow-400" />
                </div>
                <h3 className="text-3xl font-bold text-blue-900">మా దృష్టి (Vision)</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                అమరావతిని ప్రపంచ స్థాయి, సుస్థిర (sustainable) నగరంగా తీర్చిదిద్దడంలో రియల్ ఎస్టేట్ రంగం కీలక పాత్ర పోషించేలా మార్గదర్శనం చేయడం.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-300 rounded-lg p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-yellow-600 p-3 rounded-full">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-blue-900">మా ధ్యేయం (Mission)</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold mt-1">◆</span>
                  <span className="text-lg leading-relaxed">పారదర్శకమైన, నైతిక విలువలతో కూడిన రియల్ ఎస్టేట్ అభివృద్ధి</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold mt-1">◆</span>
                  <span className="text-lg leading-relaxed">డెవలపర్ల హక్కులు & వినియోగదారుల భద్రత రక్షణ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold mt-1">◆</span>
                  <span className="text-lg leading-relaxed">ప్రభుత్వ విధానాలతో సమన్వయం</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold mt-1">◆</span>
                  <span className="text-lg leading-relaxed">ప్రమాణాలు, నాణ్యత, బాధ్యతను పెంపొందించడం</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-blue-900 mb-4">మా కార్యకలాపాలు</h3>
            <div className="h-1 w-24 bg-yellow-600 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-blue-600 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-900" />
              </div>
              <h4 className="text-xl font-bold text-blue-900 mb-3 text-center">సభ్యుల కోసం</h4>
              <p className="text-gray-700 text-center leading-relaxed">
                అవగాహన కార్యక్రమాలు & శిక్షణలు
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-yellow-600 hover:shadow-xl transition-shadow">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-yellow-700" />
              </div>
              <h4 className="text-xl font-bold text-blue-900 mb-3 text-center">ప్రభుత్వ సమన్వయం</h4>
              <p className="text-gray-700 text-center leading-relaxed">
                ప్రభుత్వ శాఖలతో నిరంతర సమన్వయం రియల్ ఎస్టేట్ రంగ సమస్యలపై ప్రతినిధిత్వం
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-green-600 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="h-8 w-8 text-green-700" />
              </div>
              <h4 className="text-xl font-bold text-blue-900 mb-3 text-center">నైతిక ప్రమాణాలు</h4>
              <p className="text-gray-700 text-center leading-relaxed">
                నైతిక ప్రమాణాల అమలు & మార్గదర్శకాలు
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg p-10 shadow-2xl">
              <h3 className="text-4xl font-bold mb-6 text-center border-b-2 border-yellow-500 pb-4">
                AP-ARDA ఎందుకు?
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-500 rounded-full p-2 mt-1">
                    <Shield className="h-6 w-6 text-blue-900" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-yellow-400 mb-2">అధికారిక & విశ్వసనీయ వేదిక</h4>
                    <p className="text-lg text-blue-100 leading-relaxed">
                      అమరావతి అభివృద్ధికి కట్టుబడి ఉన్న డెవలపర్ల సమాఖ్య
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-500 rounded-full p-2 mt-1">
                    <Users className="h-6 w-6 text-blue-900" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-yellow-400 mb-2">నమ్మకం & భద్రత</h4>
                    <p className="text-lg text-blue-100 leading-relaxed">
                      పెట్టుబడిదారులకు నమ్మకం, వినియోగదారులకు భద్రత
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-12 border-t-4 border-yellow-600">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/image.png" alt="AP-ARDA" className="h-16 w-16 object-contain" />
                <div>
                  <h4 className="text-xl font-bold">AP-ARDA</h4>
                  <p className="text-sm text-blue-200">Amaravati</p>
                </div>
              </div>
              <p className="text-blue-200 leading-relaxed">
                ప్రొఫెషనల్ డెవలపర్ల సంఘం - రాజధాని అభివృద్ధికి కట్టుబడి
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-4 text-yellow-400">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-yellow-400" />
                  <span className="text-blue-200">Amaravati, Andhra Pradesh</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-yellow-400" />
                  <span className="text-blue-200">+91-XXX-XXX-XXXX</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-yellow-400" />
                  <span className="text-blue-200">info@aparda.gov.in</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-4 text-yellow-400">About</h4>
              <p className="text-blue-200 leading-relaxed">
                Andhra Pradesh Amaravati Real Estate Developers Association - An official platform for professional real estate development.
              </p>
            </div>
          </div>

          <div className="border-t border-blue-700 pt-6 text-center">
            <p className="text-blue-300">
              &copy; 2024 AP-ARDA. All Rights Reserved. | Created by Visionary Developers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
