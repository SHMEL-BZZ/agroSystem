import { makeAutoObservable } from "mobx";

export default class GreenhouseStore {
    constructor() {
        this._valves = [];
        this._greenhouses = [];

        this._selectedValve = null;
        this._selectedGreenhouse = null;

        this._isCreatingNew = false;
        this._newGreenhouseName = "";
        this._newGreenhouseDescription = "";

        makeAutoObservable(this);
    }

    // Сеттеры
    setValves(valves) { this._valves = valves; }
    setGreenhouses(greenhouses) { this._greenhouses = greenhouses; }
    setSelectedValve(valve) { this._selectedValve = valve; }
    setSelectedGreenhouse(greenhouse) { this._selectedGreenhouse = greenhouse; }
    setIsCreatingNew(bool) { this._isCreatingNew = bool; }
    setNewGreenhouseName(name) { this._newGreenhouseName = name; }
    setNewGreenhouseDescription(desc) { this._newGreenhouseDescription = desc; }

    // Геттеры
    get valves() { return this._valves; }
    get greenhouses() { return this._greenhouses; }
    get selectedValve() { return this._selectedValve; }
    get selectedGreenhouse() { return this._selectedGreenhouse; }
    get isCreatingNew() { return this._isCreatingNew; }
    get newGreenhouseName() { return this._newGreenhouseName; }
    get newGreenhouseDescription() { return this._newGreenhouseDescription; }

    // отправка формы
    async linkGreenhouseToValve() {
        if (!this._selectedValve) return alert("Выберите клапан!");

        let payload = {};
        if (this._isCreatingNew) {
            if (!this._newGreenhouseName) return alert("Введите название новой теплицы!");
            payload = {
                name: this._newGreenhouseName,
                description: this._newGreenhouseDescription
            };
        } else {
            if (!this._selectedGreenhouse) return alert("Выберите существующую теплицу!");
            payload = { blockId: this._selectedGreenhouse.id };
        }

        try {
            // Вызов API
            await linkGreenhouseToValve(this._selectedValve.id, payload);
            alert("Успешно привязано!");
        } catch (e) {
            alert(e.response?.data?.message || "Ошибка при привязке");
        }
    }
}