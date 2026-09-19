// Correção de modelo (parada 4): listas vizinhas do mesmo tipo não se fundem.
// O ListNode do @lexical/list 0.48 declara no $config um $transform que chama mergeNextSiblingListIfSameType
// (LexicalList.dev.mjs:1080-1085, função em :367-372). O transform roda em toda lista marcada como suja,
// inclusive na importação, e funde a lista seguinte do mesmo tipo. No DokMD duas listas vizinhas são nós distintos.
// A troca vale para toda instância de ListNode na página: o transform é estático e herdado por subclasses
// (getTransformSetFromKlass percorre iterStaticNodeConfigChain), então substituir o nó não removeria a fusão.
import { $isListItemNode, $isListNode, ListNode } from '@lexical/list'
import { getStaticNodeConfig, type LexicalNode } from 'lexical'

/** Cópia de updateChildrenListItemValue (LexicalList.dev.mjs:344-360, não exportada): numeração e checked. */
function $updateChildrenListItemValue(list: ListNode) {
  const isNotChecklist = list.getListType() !== 'check'
  let value = list.getStart()
  for (const child of list.getChildren()) {
    if ($isListItemNode(child)) {
      if (child.getValue() !== value) child.setValue(value)
      if (isNotChecklist && (child.getLatest() as unknown as { __checked?: boolean }).__checked != null) child.setChecked(undefined)
      if (!$isListNode(child.getFirstChild())) value++
    }
  }
}

type Transform = ((node: LexicalNode) => void) & { __dokNoMerge?: true }

/**
 * Troca o $transform do ListNode no registro estático do Lexical (getStaticNodeConfig, export público e com cache
 * por classe) antes de qualquer editor ser criado. Cada createEditor lê o $transform desse registro
 * (Lexical.dev.mjs:14427-14445 e :14549). Idempotente.
 */
export function installListNoMerge(): void {
  const own = getStaticNodeConfig(ListNode).ownNodeConfig as { $transform?: Transform } | undefined
  if (!own) throw new Error('ListNode sem $config: versão do @lexical/list diferente da 0.48')
  if (own.$transform?.__dokNoMerge) return
  const transform: Transform = (node) => $updateChildrenListItemValue(node as ListNode)
  transform.__dokNoMerge = true
  own.$transform = transform
}
